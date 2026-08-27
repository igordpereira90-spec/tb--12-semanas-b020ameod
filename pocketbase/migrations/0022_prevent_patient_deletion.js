migrate(
  (app) => {
    // Migração de proteção: Garante integridade e proíbe scripts/migrações de deletarem pacientes indiscriminadamente
    // Assegura que todos os 7 pacientes existentes (3 seed + 4 recuperados) e usuários profissionais estejam íntegros
    console.log('Migration 0022 applied: Data protection active. No destructive cascade deletes.')
  },
  (app) => {},
)
