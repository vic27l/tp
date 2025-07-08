/*
  # Fix RLS policies for public access

  1. Changes
    - Drop existing restrictive policies
    - Create new policies that allow public access
    - This enables the application to work without authentication

  2. Security
    - Allow public read/write access to both tables
    - Remove authentication requirements
*/

-- Drop existing policies for pacientes
DROP POLICY IF EXISTS "Users can read all pacientes" ON pacientes;
DROP POLICY IF EXISTS "Users can insert pacientes" ON pacientes;
DROP POLICY IF EXISTS "Users can update pacientes" ON pacientes;
DROP POLICY IF EXISTS "Users can delete pacientes" ON pacientes;

-- Drop existing policies for consultas
DROP POLICY IF EXISTS "Users can read all consultas" ON consultas;
DROP POLICY IF EXISTS "Users can insert consultas" ON consultas;
DROP POLICY IF EXISTS "Users can update consultas" ON consultas;
DROP POLICY IF EXISTS "Users can delete consultas" ON consultas;

-- Create new public policies for pacientes
CREATE POLICY "Public can read all pacientes"
  ON pacientes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert pacientes"
  ON pacientes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update pacientes"
  ON pacientes
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete pacientes"
  ON pacientes
  FOR DELETE
  TO public
  USING (true);

-- Create new public policies for consultas
CREATE POLICY "Public can read all consultas"
  ON consultas
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert consultas"
  ON consultas
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update consultas"
  ON consultas
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete consultas"
  ON consultas
  FOR DELETE
  TO public
  USING (true);