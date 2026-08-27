migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')

    // Lista dos 4 pacientes deletados para restauração com os IDs e emails solicitados
    const patientsToRestore = [
      {
        id: '823yf7h0wrutl01',
        name: 'Paciente Recuperado 1',
        email: 'recuperado1@tb12semanas.com',
      },
      {
        id: 'z5xp3k5gjfo8huh',
        name: 'Paciente Recuperado 2',
        email: 'recuperado2@tb12semanas.com',
      },
      {
        id: '698yy4urpns2t7c',
        name: 'Paciente Recuperado 3',
        email: 'recuperado3@tb12semanas.com',
      },
      {
        id: '1bjeu7k22l93gcl',
        name: 'Paciente Recuperado 4',
        email: 'recuperado4@tb12semanas.com',
      },
    ]

    for (const p of patientsToRestore) {
      let existing = null
      try {
        existing = app.findFirstRecordByData('users', 'id', p.id)
      } catch (_) {
        try {
          existing = app.findAuthRecordByEmail('users', p.email)
        } catch (_) {}
      }

      if (existing) {
        // Garantir role e verificação
        existing.set('role', 'patient')
        existing.setVerified(true)
        if (!existing.getString('name')) {
          existing.set('name', p.name)
        }
        app.save(existing)
        continue
      }

      const record = new Record(usersCol)
      record.set('id', p.id)
      record.setEmail(p.email)
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', p.name)
      record.set('role', 'patient')
      record.set('points', 0)
      record.set('badges', [])
      record.set('consent_accepted', false)
      record.set('age', 0)
      app.save(record)
    }
  },
  (app) => {
    // Reversão opcional (não remove para evitar deleções indesejadas)
  },
)
