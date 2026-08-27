"""Generate synthetic North America supply-chain, SAP MDM, and BI datasets."""
from __future__ import annotations

import csv
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
PROC = ROOT / "data" / "processed"
DOCS_DATA = ROOT / "docs" / "assets" / "data"

random.seed(42)

DCS = [
    {"dc_id": "DC-OAK", "name": "Oakville DC", "lat": 43.4675, "lon": -79.6877, "capacity_tons": 4200, "fixed_cost": 180000},
    {"dc_id": "DC-MIS", "name": "Mississauga DC", "lat": 43.5890, "lon": -79.6441, "capacity_tons": 5100, "fixed_cost": 210000},
    {"dc_id": "DC-HAM", "name": "Hamilton DC", "lat": 43.2557, "lon": -79.8711, "capacity_tons": 3600, "fixed_cost": 150000},
    {"dc_id": "DC-BUF", "name": "Buffalo Cross-Dock", "lat": 42.8864, "lon": -78.8784, "capacity_tons": 2900, "fixed_cost": 135000},
    {"dc_id": "DC-DET", "name": "Detroit Hub", "lat": 42.3314, "lon": -83.0458, "capacity_tons": 3300, "fixed_cost": 160000},
]

CUSTOMERS = [
    {"customer_id": "C-TOR", "name": "Toronto Metro", "lat": 43.6532, "lon": -79.3832, "demand_tons": 1800, "region": "ON"},
    {"customer_id": "C-OTT", "name": "Ottawa East", "lat": 45.4215, "lon": -75.6972, "demand_tons": 620, "region": "ON"},
    {"customer_id": "C-MTL", "name": "Montreal South", "lat": 45.5017, "lon": -73.5673, "demand_tons": 980, "region": "QC"},
    {"customer_id": "C-KW", "name": "Kitchener-Waterloo", "lat": 43.4516, "lon": -80.4925, "demand_tons": 540, "region": "ON"},
    {"customer_id": "C-LON", "name": "London SW", "lat": 42.9849, "lon": -81.2453, "demand_tons": 410, "region": "ON"},
    {"customer_id": "C-BUF", "name": "Buffalo Retail", "lat": 42.8864, "lon": -78.8784, "demand_tons": 700, "region": "NY"},
    {"customer_id": "C-ROC", "name": "Rochester", "lat": 43.1566, "lon": -77.6088, "demand_tons": 380, "region": "NY"},
    {"customer_id": "C-DET", "name": "Detroit Auto Belt", "lat": 42.3314, "lon": -83.0458, "demand_tons": 920, "region": "MI"},
    {"customer_id": "C-CLE", "name": "Cleveland", "lat": 41.4993, "lon": -81.6944, "demand_tons": 510, "region": "OH"},
    {"customer_id": "C-CHI", "name": "Chicago North", "lat": 41.8781, "lon": -87.6298, "demand_tons": 1100, "region": "IL"},
]


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def write_csv(path: Path, rows: list[dict], fieldnames: list[str] | None = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    fields = fieldnames or list(rows[0].keys())
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def generate_lanes() -> list[dict]:
    lanes = []
    for dc in DCS:
        for cust in CUSTOMERS:
            dist = haversine_km(dc["lat"], dc["lon"], cust["lat"], cust["lon"])
            rate = 0.42 + dist * 0.018
            if cust["region"] in {"NY", "MI", "OH", "IL"} and dc["dc_id"] not in {"DC-BUF", "DC-DET"}:
                rate += 12
            if dc["dc_id"] in {"DC-BUF", "DC-DET"} and cust["region"] in {"NY", "MI", "OH", "IL"}:
                rate *= 0.88
            lanes.append(
                {
                    "lane_id": f"{dc['dc_id']}-{cust['customer_id']}",
                    "dc_id": dc["dc_id"],
                    "customer_id": cust["customer_id"],
                    "distance_km": round(dist, 1),
                    "cost_per_ton": round(rate, 2),
                    "transit_days": round(max(0.5, dist / 480), 2),
                }
            )
    return lanes


def greedy_optimize(lanes: list[dict]) -> list[dict]:
    by_customer: dict[str, list[dict]] = {}
    for lane in lanes:
        by_customer.setdefault(lane["customer_id"], []).append(lane)
    for cid in by_customer:
        by_customer[cid].sort(key=lambda x: x["cost_per_ton"])

    remaining = {d["dc_id"]: d["capacity_tons"] for d in DCS}
    demand = {c["customer_id"]: c["demand_tons"] for c in CUSTOMERS}
    shipments = []

    for cid, need in sorted(demand.items(), key=lambda x: -x[1]):
        left = need
        for lane in by_customer[cid]:
            if left <= 0:
                break
            avail = remaining[lane["dc_id"]]
            if avail <= 0:
                continue
            qty = min(left, avail)
            remaining[lane["dc_id"]] -= qty
            left -= qty
            shipments.append(
                {
                    "dc_id": lane["dc_id"],
                    "customer_id": cid,
                    "tons": qty,
                    "cost_per_ton": lane["cost_per_ton"],
                    "total_cost": round(qty * lane["cost_per_ton"], 2),
                    "distance_km": lane["distance_km"],
                    "transit_days": lane["transit_days"],
                }
            )
        if left > 0:
            shipments.append(
                {
                    "dc_id": "UNMET",
                    "customer_id": cid,
                    "tons": left,
                    "cost_per_ton": 0,
                    "total_cost": 0,
                    "distance_km": 0,
                    "transit_days": 0,
                }
            )
    return shipments


def generate_sap_legacy():
    plants = ["1000", "1100", "1200", "2000"]
    materials = []
    for i in range(1, 81):
        materials.append(
            {
                "legacy_matnr": f"MAT{i:05d}",
                "description": f"NA Cementitious Blend {i:03d}",
                "uom": random.choice(["TO", "EA", "PAL"]),
                "plant": random.choice(plants),
                "mrp_type": random.choice(["PD", "VB", "ND"]),
                "valuation_class": random.choice(["3000", "3100", "7900"]),
                "gross_weight": round(random.uniform(0.5, 25), 2),
                "dq_flag": random.choice(["OK", "OK", "OK", "MISSING_UOM", "DUP_DESC", "BAD_PLANT"]),
            }
        )

    customers = []
    for i in range(1, 61):
        sold = f"7{i:07d}"
        customers.append(
            {
                "legacy_kunnr": sold,
                "name1": f"NA Customer {i:03d} Ltd",
                "country": random.choice(["CA", "US"]),
                "region": random.choice(["ON", "QC", "NY", "MI", "OH", "IL"]),
                "postal_code": random.choice(["L6H", "M5V", "H3B", "14202", "48226"]),
                "sales_org": random.choice(["1000", "2000"]),
                "dist_channel": random.choice(["10", "20"]),
                "division": "00",
                "partner_role": random.choice(["SP", "SH", "BP", "PY"]),
                "dq_flag": random.choice(["OK", "OK", "OK", "ADDR_INCOMPLETE", "BAD_TAX", "ORPHAN_SHIPTO"]),
            }
        )

    vendors = []
    for i in range(1, 41):
        vendors.append(
            {
                "legacy_lifnr": f"V{i:07d}",
                "name1": f"Supplier {i:03d} Inc",
                "country": random.choice(["CA", "US", "MX"]),
                "payment_terms": random.choice(["NT30", "NT45", "NT60"]),
                "currency": random.choice(["CAD", "USD"]),
                "purch_org": random.choice(["1000", "2000"]),
                "dq_flag": random.choice(["OK", "OK", "BANK_MISSING", "DUP_VAT", "OK"]),
            }
        )

    ship_tos = []
    for i, c in enumerate(customers[:40], start=1):
        ship_tos.append(
            {
                "legacy_ship_to": f"8{i:07d}",
                "sold_to": c["legacy_kunnr"],
                "name1": f"{c['name1']} Ship-To",
                "country": c["country"],
                "region": c["region"],
                "incoterms": random.choice(["FOB", "DAP", "EXW"]),
                "dq_flag": random.choice(["OK", "OK", "ORPHAN_SHIPTO", "OK"]),
            }
        )
    return materials, customers, vendors, ship_tos


def clean_sap(materials, customers, vendors, ship_tos):
    mat_map = [
        {
            "source_matnr": m["legacy_matnr"],
            "target_matnr": f"S4-{m['legacy_matnr']}",
            "description": m["description"].strip().title(),
            "uom": m["uom"] or "TO",
            "plant": m["plant"],
            "mrp_type": m["mrp_type"],
            "valuation_class": m["valuation_class"],
            "migration_status": "READY",
        }
        for m in materials
        if m["dq_flag"] not in {"MISSING_UOM", "BAD_PLANT"}
    ]
    cust_map = [
        {
            "source_kunnr": c["legacy_kunnr"],
            "target_bp": f"BP{c['legacy_kunnr']}",
            "name1": c["name1"],
            "country": c["country"],
            "region": c["region"],
            "sales_org": c["sales_org"],
            "partner_role": c["partner_role"],
            "migration_status": "READY" if c["dq_flag"] == "OK" else "NEEDS_REVIEW",
        }
        for c in customers
        if c["dq_flag"] != "BAD_TAX"
    ]
    vend_map = [
        {
            "source_lifnr": v["legacy_lifnr"],
            "target_bp": f"BP{v['legacy_lifnr']}",
            "name1": v["name1"],
            "country": v["country"],
            "payment_terms": v["payment_terms"],
            "currency": v["currency"],
            "migration_status": "READY" if v["dq_flag"] == "OK" else "NEEDS_REVIEW",
        }
        for v in vendors
        if v["dq_flag"] != "DUP_VAT"
    ]
    valid_sold = {c["source_kunnr"] for c in cust_map}
    ship_map = [
        {
            "source_ship_to": s["legacy_ship_to"],
            "target_bp": f"BP{s['legacy_ship_to']}",
            "sold_to_bp": f"BP{s['sold_to']}",
            "incoterms": s["incoterms"],
            "migration_status": "READY",
        }
        for s in ship_tos
        if s["sold_to"] in valid_sold and s["dq_flag"] != "ORPHAN_SHIPTO"
    ]
    return mat_map, cust_map, vend_map, ship_map


def generate_bi(shipments: list[dict]) -> list[dict]:
    months = [
        "2025-09", "2025-10", "2025-11", "2025-12",
        "2026-01", "2026-02", "2026-03", "2026-04",
        "2026-05", "2026-06", "2026-07", "2026-08",
    ]
    plants = ["Oakville", "Mississauga", "Hamilton", "Buffalo", "Detroit"]
    total_opt = sum(s["total_cost"] for s in shipments if s["dc_id"] != "UNMET")
    rows = []
    for month in months:
        for plant in plants:
            base = random.randint(850, 1400)
            rows.append(
                {
                    "month": month,
                    "plant": plant,
                    "orders": base,
                    "otif": round(random.uniform(0.86, 0.98), 3),
                    "freight_spend_cad": round(base * random.uniform(38, 62), 2),
                    "inventory_tons": round(random.uniform(1200, 2800), 1),
                    "inventory_turns": round(random.uniform(4.2, 9.5), 2),
                    "fill_rate": round(random.uniform(0.90, 0.995), 3),
                    "corridor": "Canada-US Great Lakes",
                    "network_opt_cost_ref": round(total_opt / len(months), 2),
                }
            )
    return rows


def main() -> None:
    for d in (RAW, PROC, DOCS_DATA):
        d.mkdir(parents=True, exist_ok=True)

    write_csv(RAW / "distribution_centers.csv", DCS)
    write_csv(RAW / "customers.csv", CUSTOMERS)
    lanes = generate_lanes()
    write_csv(RAW / "lanes.csv", lanes)
    shipments = greedy_optimize(lanes)
    write_csv(PROC / "optimal_shipments.csv", shipments)
    write_csv(DOCS_DATA / "optimal_shipments.csv", shipments)
    write_csv(DOCS_DATA / "lanes.csv", lanes)
    write_csv(DOCS_DATA / "distribution_centers.csv", DCS)
    write_csv(DOCS_DATA / "customers.csv", CUSTOMERS)

    materials, customers, vendors, ship_tos = generate_sap_legacy()
    write_csv(RAW / "legacy_materials.csv", materials)
    write_csv(RAW / "legacy_customers.csv", customers)
    write_csv(RAW / "legacy_vendors.csv", vendors)
    write_csv(RAW / "legacy_ship_tos.csv", ship_tos)

    mat_map, cust_map, vend_map, ship_map = clean_sap(materials, customers, vendors, ship_tos)
    write_csv(PROC / "map_materials.csv", mat_map)
    write_csv(PROC / "map_customers.csv", cust_map)
    write_csv(PROC / "map_vendors.csv", vend_map)
    write_csv(PROC / "map_ship_tos.csv", ship_map)
    write_csv(DOCS_DATA / "map_materials.csv", mat_map)
    write_csv(DOCS_DATA / "map_customers.csv", cust_map)
    write_csv(
        DOCS_DATA / "dq_summary.csv",
        [
            {"object": "Material", "legacy_count": len(materials), "ready_count": len(mat_map), "pass_rate": round(len(mat_map) / len(materials), 3)},
            {"object": "Customer BP", "legacy_count": len(customers), "ready_count": len(cust_map), "pass_rate": round(len(cust_map) / len(customers), 3)},
            {"object": "Vendor BP", "legacy_count": len(vendors), "ready_count": len(vend_map), "pass_rate": round(len(vend_map) / len(vendors), 3)},
            {"object": "Ship-To", "legacy_count": len(ship_tos), "ready_count": len(ship_map), "pass_rate": round(len(ship_map) / len(ship_tos), 3)},
        ],
    )

    bi = generate_bi(shipments)
    write_csv(PROC / "ops_control_tower.csv", bi)
    write_csv(DOCS_DATA / "ops_control_tower.csv", bi)
    tableau = ROOT / "tableau" / "extracts"
    tableau.mkdir(parents=True, exist_ok=True)
    write_csv(tableau / "ops_control_tower.csv", bi)
    write_csv(tableau / "optimal_shipments.csv", shipments)

    total_cost = sum(s["total_cost"] for s in shipments if s["dc_id"] != "UNMET")
    unmet = sum(s["tons"] for s in shipments if s["dc_id"] == "UNMET")
    print(f"Shipments: {len(shipments)} | Network cost: ${total_cost:,.0f} | Unmet tons: {unmet}")
    print(f"SAP ready materials: {len(mat_map)} / {len(materials)}")


if __name__ == "__main__":
    main()
