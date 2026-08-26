migrate(
  (app) => {
    try {
      // 1. Limpar questionários e registros dependentes de pacientes extras
      app
        .db()
        .newQuery(
          "DELETE FROM questionnaires WHERE patient IN (SELECT id FROM users WHERE role = 'patient' AND email NOT IN ('rafael@example.com', 'maria@example.com', 'joao@example.com'))",
        )
        .execute()

      app
        .db()
        .newQuery(
          "DELETE FROM patient_unlocks WHERE patient IN (SELECT id FROM users WHERE role = 'patient' AND email NOT IN ('rafael@example.com', 'maria@example.com', 'joao@example.com'))",
        )
        .execute()

      app
        .db()
        .newQuery(
          "DELETE FROM professional_notes WHERE patient IN (SELECT id FROM users WHERE role = 'patient' AND email NOT IN ('rafael@example.com', 'maria@example.com', 'joao@example.com'))",
        )
        .execute()

      app
        .db()
        .newQuery(
          "DELETE FROM material_completions WHERE patient IN (SELECT id FROM users WHERE role = 'patient' AND email NOT IN ('rafael@example.com', 'maria@example.com', 'joao@example.com'))",
        )
        .execute()

      app
        .db()
        .newQuery(
          "DELETE FROM notifications WHERE recipient IN (SELECT id FROM users WHERE role = 'patient' AND email NOT IN ('rafael@example.com', 'maria@example.com', 'joao@example.com'))",
        )
        .execute()

      // 2. Deletar pacientes extras mantendo no máximo 3 com role = 'patient'
      app
        .db()
        .newQuery(
          "DELETE FROM users WHERE role = 'patient' AND email NOT IN ('rafael@example.com', 'maria@example.com', 'joao@example.com')",
        )
        .execute()
    } catch (e) {
      console.log('Error in 0019_cleanup_extra_patients:', e)
    }
  },
  (app) => {},
)
