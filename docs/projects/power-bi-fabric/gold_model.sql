-- Power BI and Fabric design on synthetic data.
-- These statements describe bronze, silver, and gold tables for the
-- North America ops CSVs used by the BI page. They are not a published
-- Fabric workspace. Load the CSVs first, then run the silver and gold steps.

-- Bronze: files landed as-is
--   bronze.ops_control_tower   <- ops_control_tower.csv
--   bronze.sales_by_category   <- sales_by_category.csv
--   bronze.otif_exceptions     <- otif_exceptions.csv
--   bronze.dim_plants          <- dim_plants.csv

CREATE OR REPLACE TABLE silver.ops_control_tower AS
SELECT
  CAST(month AS VARCHAR) AS month_key,
  plant,
  plant_code,
  country,
  region,
  market,
  CAST(lat AS DOUBLE) AS lat,
  CAST(lon AS DOUBLE) AS lon,
  CAST(orders AS INTEGER) AS orders,
  CAST(late_orders AS INTEGER) AS late_orders,
  CAST(otif AS DOUBLE) AS otif,
  CAST(fill_rate AS DOUBLE) AS fill_rate,
  CAST(freight_spend_cad AS DOUBLE) AS freight_spend_cad,
  CAST(inventory_tons AS DOUBLE) AS inventory_tons,
  CAST(inventory_turns AS DOUBLE) AS inventory_turns,
  CAST(sales_cad AS DOUBLE) AS sales_cad
FROM bronze.ops_control_tower
WHERE plant IS NOT NULL
  AND month IS NOT NULL;

CREATE OR REPLACE TABLE silver.sales_by_category AS
SELECT
  CAST(month AS VARCHAR) AS month_key,
  plant,
  country,
  region,
  category,
  product_line,
  sku_family,
  CAST(units_sold AS INTEGER) AS units_sold,
  CAST(revenue_cad AS DOUBLE) AS revenue_cad,
  CAST(gross_margin_pct AS DOUBLE) AS gross_margin_pct
FROM bronze.sales_by_category
WHERE plant IS NOT NULL
  AND month IS NOT NULL
  AND sku_family IS NOT NULL;

CREATE OR REPLACE TABLE silver.otif_exceptions AS
SELECT
  exception_id,
  CAST(month AS VARCHAR) AS month_key,
  plant,
  country,
  region,
  CAST(order_impact AS INTEGER) AS order_impact,
  root_cause,
  severity,
  owner
FROM bronze.otif_exceptions
WHERE exception_id IS NOT NULL;

CREATE OR REPLACE TABLE gold.dim_plant AS
SELECT DISTINCT
  plant_code,
  plant,
  country,
  region,
  market,
  lat,
  lon
FROM silver.ops_control_tower;

CREATE OR REPLACE TABLE gold.dim_date AS
SELECT DISTINCT
  month_key,
  CAST(SUBSTR(month_key, 1, 4) AS INTEGER) AS calendar_year,
  CAST(SUBSTR(month_key, 6, 2) AS INTEGER) AS calendar_month
FROM silver.ops_control_tower;

CREATE OR REPLACE TABLE gold.dim_product AS
SELECT DISTINCT
  sku_family,
  product_line,
  category
FROM silver.sales_by_category;

CREATE OR REPLACE TABLE gold.fact_plant_month AS
SELECT
  month_key,
  plant_code,
  orders,
  late_orders,
  otif,
  fill_rate,
  freight_spend_cad,
  inventory_tons,
  inventory_turns,
  sales_cad
FROM silver.ops_control_tower;

CREATE OR REPLACE TABLE gold.fact_sales AS
SELECT
  s.month_key,
  p.plant_code,
  s.sku_family,
  s.units_sold,
  s.revenue_cad,
  s.gross_margin_pct
FROM silver.sales_by_category AS s
JOIN gold.dim_plant AS p
  ON p.plant = s.plant;

CREATE OR REPLACE TABLE gold.fact_exception AS
SELECT
  e.exception_id,
  e.month_key,
  p.plant_code,
  e.order_impact,
  e.root_cause,
  e.severity,
  e.owner
FROM silver.otif_exceptions AS e
JOIN gold.dim_plant AS p
  ON p.plant = e.plant;

-- Semantic model relationships
--   fact_plant_month[month_key]  -> dim_date[month_key]
--   fact_plant_month[plant_code] -> dim_plant[plant_code]
--   fact_sales[month_key]        -> dim_date[month_key]
--   fact_sales[plant_code]       -> dim_plant[plant_code]
--   fact_sales[sku_family]       -> dim_product[sku_family]
--   fact_exception[month_key]    -> dim_date[month_key]
--   fact_exception[plant_code]   -> dim_plant[plant_code]
