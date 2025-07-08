</div>

              <div className="pdf-export-checkbox-field">
                <label>🏥 Outros Acompanhamentos</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.outros_acompanhamentos === true ? 'checked' : ''}`}>
                      {paciente.outros_acompanhamentos === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.outros_acompanhamentos === false ? 'checked' : ''}`}>
                      {paciente.outros_acompanhamentos === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
                {paciente.quais_acompanhamentos && (
                  <div className="pdf-export-qual-field">{paciente.quais_acompanhamentos}</div>
                )}
              </div>

              {/* Hábitos Alimentares */}
              <div className="pdf-export-checkbox-field">
                <label>🍼 Mamadeira</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.mamadeira === true ? 'checked' : ''}`}>
                      {paciente.mamadeira === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.mamadeira === false ? 'checked' : ''}`}>
                      {paciente.mamadeira === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🍭 Chupeta</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.chupeta === true ? 'checked' : ''}`}>
                      {paciente.chupeta === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.chupeta === false ? 'checked' : ''}`}>
                      {paciente.chupeta === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>👍 Chupar Dedo</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.chupar_dedo === true ? 'checked' : ''}`}>
                      {paciente.chupar_dedo === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.chupar_dedo === false ? 'checked' : ''}`}>
                      {paciente.chupar_dedo === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🦷 Roer Unha</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.roer_unha === true ? 'checked' : ''}`}>
                      {paciente.roer_unha === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.roer_unha === false ? 'checked' : ''}`}>
                      {paciente.roer_unha === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>💊 Uso de Flúor</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.uso_fluor === true ? 'checked' : ''}`}>
                      {paciente.uso_fluor === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.uso_fluor === false ? 'checked' : ''}`}>
                      {paciente.uso_fluor === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-text-field">
                <label>🍽️ Frequência das Refeições</label>
                <div className="pdf-export-text-field-value">{formatarTexto(paciente.frequencia_refeicoes)}</div>
              </div>

              <div className="pdf-export-text-field">
                <label>🥤 Frequência de Doces</label>
                <div className="pdf-export-text-field-value">{formatarTexto(paciente.frequencia_doces)}</div>
              </div>

              <div className="pdf-export-text-field">
                <label>🪥 Frequência de Escovação</label>
                <div className="pdf-export-text-field-value">{formatarTexto(paciente.frequencia_escovacao)}</div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🧽 Usa Fio Dental</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.usa_fio_dental === true ? 'checked' : ''}`}>
                      {paciente.usa_fio_dental === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.usa_fio_dental === false ? 'checked' : ''}`}>
                      {paciente.usa_fio_dental === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-checkbox-field">
                <label>🧴 Usa Enxaguante</label>
                <div className="pdf-export-checkbox-container">
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.usa_enxaguante === true ? 'checked' : ''}`}>
                      {paciente.usa_enxaguante === true ? 'SIM' : 'SIM'}
                    </div>
                    <span className="pdf-export-checkbox-label">SIM</span>
                  </div>
                  <div className="pdf-export-checkbox">
                    <div className={`pdf-export-checkbox-box ${paciente.usa_enxaguante === false ? 'checked' : ''}`}>
                      {paciente.usa_enxaguante === false ? 'NÃO' : 'NÃO'}
                    </div>
                    <span className="pdf-export-checkbox-label">NÃO</span>
                  </div>
                </div>
              </div>

              <div className="pdf-export-text-field">
                <label>📝 Observações</label>
                <div className="pdf-export-text-field-value">{formatarTexto(paciente.observacoes)}</div>
              </div>

            </div>
          </div>

          {/* Mapa Dental */}
          <div className="pdf-export-dental-map">
            <h3 className="pdf-export-section-title">MAPA DENTAL</h3>
            <MapaDental readonly={true} />
          </div>

          {/* Assinaturas */}
          <div className="pdf-export-signatures">
            <div className="pdf-export-signature">
              <div className="pdf-export-signature-line"></div>
              <div className="pdf-export-signature-text">Assinatura do Responsável</div>
            </div>
            <div className="pdf-export-signature">
              <div className="pdf-export-signature-line"></div>
              <div className="pdf-export-signature-text">Assinatura do Profissional</div>
            </div>
          </div>
        </div>

        {/* Seção de Consultas - Visível apenas na tela */}
        <div className="screen-only space-y-6">
          {/* Histórico de Consultas */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Histórico de Consultas
              </h2>
              <button
                onClick={() => navigate(createPageUrl("NovaConsulta", { paciente_id: paciente.id }))}
                className="glass-button px-4 py-2 rounded-lg text-white font-medium hover:bg-emerald-500/30 transition-all"
              >
                Nova Consulta
              </button>
            </div>

            {consultas.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/70 mb-4">Nenhuma consulta registrada</p>
                <button
                  onClick={() => navigate(createPageUrl("NovaConsulta", { paciente_id: paciente.id }))}
                  className="glass-button px-6 py-3 rounded-lg text-white font-semibold hover:bg-emerald-500/30 transition-all"
                >
                  Registrar Primeira Consulta
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {consultas.map((consulta) => (
                  <div key={consulta.id} className="glass-card rounded-lg p-4 hover:bg-white/5 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">
                            {consulta.data_consulta 
                              ? format(new Date(consulta.data_consulta), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                              : "Data não informada"
                            }
                          </h3>
                          <p className="text-white/70 text-sm">
                            {consulta.motivo_consulta || "Consulta de rotina"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(createPageUrl("VisualizarConsulta", { id: consulta.id }))}
                        className="glass-button p-2 rounded-lg text-white hover:bg-emerald-500/30 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                    {consulta.observacoes && (
                      <div className="mt-3 pl-13">
                        <p className="text-white/80 text-sm">{consulta.observacoes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
