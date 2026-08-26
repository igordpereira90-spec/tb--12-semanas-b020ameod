migrate(
  (app) => {
    try {
      // 1. Limpar questionários e registros órfãos de usuários de teste extras
      app
        .db()
        .newQuery(`
        DELETE FROM questionnaires WHERE patient IN (
          SELECT id FROM users WHERE LOWER(TRIM(email)) NOT IN ('igordpereira90@gmail.com', 'rafael@example.com', 'maria@example.com', 'joao@example.com')
        )
      `)
        .execute()

      app
        .db()
        .newQuery(`
        DELETE FROM patient_unlocks WHERE patient IN (
          SELECT id FROM users WHERE LOWER(TRIM(email)) NOT IN ('igordpereira90@gmail.com', 'rafael@example.com', 'maria@example.com', 'joao@example.com')
        )
      `)
        .execute()

      app
        .db()
        .newQuery(`
        DELETE FROM professional_notes WHERE patient IN (
          SELECT id FROM users WHERE LOWER(TRIM(email)) NOT IN ('igordpereira90@gmail.com', 'rafael@example.com', 'maria@example.com', 'joao@example.com')
        )
      `)
        .execute()

      app
        .db()
        .newQuery(`
        DELETE FROM material_completions WHERE patient IN (
          SELECT id FROM users WHERE LOWER(TRIM(email)) NOT IN ('igordpereira90@gmail.com', 'rafael@example.com', 'maria@example.com', 'joao@example.com')
        )
      `)
        .execute()

      app
        .db()
        .newQuery(`
        DELETE FROM notifications WHERE recipient IN (
          SELECT id FROM users WHERE LOWER(TRIM(email)) NOT IN ('igordpereira90@gmail.com', 'rafael@example.com', 'maria@example.com', 'joao@example.com')
        )
      `)
        .execute()

      // 2. Deletar usuários extras de teste
      app
        .db()
        .newQuery(`
        DELETE FROM users WHERE LOWER(TRIM(email)) NOT IN ('igordpereira90@gmail.com', 'rafael@example.com', 'maria@example.com', 'joao@example.com')
      `)
        .execute()
    } catch (e) {
      console.log('Error cleaning test records:', e)
    }
  },
  (app) => {
    // Down migration empty
  },
)
