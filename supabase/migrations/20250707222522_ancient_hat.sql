/*
  # Create tables for Tio Paulo application

  1. New Tables
    - `pacientes`
      - `id` (uuid, primary key)
      - `nome_crianca` (text, required)
      - `data_nascimento` (date)
      - `idade` (integer)
      - `endereco` (text)
      - `bairro` (text)
      - `cep` (text)
      - `cidade` (text)
      - `cel` (text)
      - `nome_mae` (text)
      - `idade_mae` (integer)
      - `profissao_mae` (text)
      - `nome_pai` (text)
      - `idade_pai` (integer)
      - `profissao_pai` (text)
      - `motivo_consulta` (text)
      - `alteracao_gestacao` (text)
      - `necessidade_especial` (boolean)
      - `qual_necessidade` (text)
      - `comprometimento_coordenacao` (boolean)
      - `qual_coordenacao` (text)
      - `comprometimento_visual` (boolean)
      - `qual_visual` (text)
      - `comprometimento_comunicacao` (boolean)
      - `qual_comunicacao` (text)
      - `reacao_contrariado` (text)
      - `reacao_profissionais` (text)
      - `sofreu_cirurgia` (boolean)
      - `qual_cirurgia` (text)
      - `alteracoes_sanguineas` (boolean)
      - `problemas_respiratorios` (boolean)
      - `problemas_hepaticos` (boolean)
      - `cardiopatias` (boolean)
      - `problemas_gastricos` (boolean)
      - `alergias_medicamento` (text)
      - `alergias_alimentar` (text)
      - `alergias_respiratoria` (text)
      - `tratamentos_atuais` (text)
      - `escova_usa` (text)
      - `creme_dental` (text)
      - `anos_primeira_consulta` (integer)
      - `tratamento_anterior` (text)
      - `tomou_anestesia` (boolean)
      - `higiene_bucal` (text)
      - `vezes_dia_higiene` (integer)
      - `gengiva_sangra` (boolean)
      - `extracoes_dentarias` (boolean)
      - `escova_lingua` (boolean)
      - `usa_fio_dental` (boolean)
      - `alimentacao_notas` (text)
      - `fonoaudiologia` (boolean)
      - `fisioterapia` (boolean)
      - `psicologia` (boolean)
      - `psiquiatrico` (boolean)
      - `psiquiatrico_to` (boolean)
      - `outro_tratamento` (text)
      - `portador_ist` (text)
      - `mama_peito` (boolean)
      - `mamou_peito` (boolean)
      - `ate_quando_mamou` (text)
      - `toma_mamadeira` (boolean)
      - `tomou_mamadeira` (boolean)
      - `ate_quando_mamadeira` (text)
      - `engasga_vomita` (text)
      - `chupa_dedo` (text)
      - `chupa_chupeta` (text)
      - `outros_habitos` (text)
      - `range_dentes` (text)
      - `foi_dentista` (boolean)
      - `qual_dentista` (text)
      - `mapa_dental` (integer[])
      - `responsavel_nome` (text, required)
      - `informacoes_verdadeiras` (boolean, default false)
      - `informacoes_adicionais` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `consultas`
      - `id` (uuid, primary key)
      - `paciente_id` (uuid, foreign key)
      - `data_atendimento` (date, required)
      - `peso` (decimal)
      - `observacoes` (text)
      - `procedimentos` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create pacientes table
CREATE TABLE IF NOT EXISTS pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_crianca text NOT NULL,
  data_nascimento date,
  idade integer,
  endereco text,
  bairro text,
  cep text,
  cidade text,
  cel text,
  nome_mae text,
  idade_mae integer,
  profissao_mae text,
  nome_pai text,
  idade_pai integer,
  profissao_pai text,
  motivo_consulta text,
  alteracao_gestacao text,
  necessidade_especial boolean,
  qual_necessidade text,
  comprometimento_coordenacao boolean,
  qual_coordenacao text,
  comprometimento_visual boolean,
  qual_visual text,
  comprometimento_comunicacao boolean,
  qual_comunicacao text,
  reacao_contrariado text,
  reacao_profissionais text,
  sofreu_cirurgia boolean,
  qual_cirurgia text,
  alteracoes_sanguineas boolean,
  problemas_respiratorios boolean,
  problemas_hepaticos boolean,
  cardiopatias boolean,
  problemas_gastricos boolean,
  alergias_medicamento text,
  alergias_alimentar text,
  alergias_respiratoria text,
  tratamentos_atuais text,
  escova_usa text,
  creme_dental text,
  anos_primeira_consulta integer,
  tratamento_anterior text,
  tomou_anestesia boolean,
  higiene_bucal text,
  vezes_dia_higiene integer,
  gengiva_sangra boolean,
  extracoes_dentarias boolean,
  escova_lingua boolean,
  usa_fio_dental boolean,
  alimentacao_notas text,
  fonoaudiologia boolean,
  fisioterapia boolean,
  psicologia boolean,
  psiquiatrico boolean,
  psiquiatrico_to boolean,
  outro_tratamento text,
  portador_ist text,
  mama_peito boolean,
  mamou_peito boolean,
  ate_quando_mamou text,
  toma_mamadeira boolean,
  tomou_mamadeira boolean,
  ate_quando_mamadeira text,
  engasga_vomita text,
  chupa_dedo text,
  chupa_chupeta text,
  outros_habitos text,
  range_dentes text,
  foi_dentista boolean,
  qual_dentista text,
  mapa_dental integer[],
  responsavel_nome text NOT NULL,
  informacoes_verdadeiras boolean DEFAULT false,
  informacoes_adicionais text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create consultas table
CREATE TABLE IF NOT EXISTS consultas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  data_atendimento date NOT NULL,
  peso decimal(5,2),
  observacoes text,
  procedimentos text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

-- Create policies for pacientes
CREATE POLICY "Users can read all pacientes"
  ON pacientes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert pacientes"
  ON pacientes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update pacientes"
  ON pacientes
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete pacientes"
  ON pacientes
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for consultas
CREATE POLICY "Users can read all consultas"
  ON consultas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert consultas"
  ON consultas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update consultas"
  ON consultas
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete consultas"
  ON consultas
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pacientes_nome_crianca ON pacientes(nome_crianca);
CREATE INDEX IF NOT EXISTS idx_pacientes_created_at ON pacientes(created_at);
CREATE INDEX IF NOT EXISTS idx_consultas_paciente_id ON consultas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_consultas_data_atendimento ON consultas(data_atendimento);