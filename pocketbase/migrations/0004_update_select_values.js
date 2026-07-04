migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('questionnaires')

    col.fields.remove(col.fields.getByName('improvement_areas'))
    col.fields.add(
      new SelectField({
        name: 'improvement_areas',
        values: ['Humor', 'Energia/disposição', 'Sono', 'Ansiedade', 'Outro'],
        maxSelect: 5,
      }),
    )

    col.fields.remove(col.fields.getByName('appetite_weight_change'))
    col.fields.add(
      new SelectField({
        name: 'appetite_weight_change',
        values: [
          'Sem alteração do apetite ou peso',
          'Aumento do apetite e peso',
          'Diminuição do apetite e peso',
        ],
        maxSelect: 1,
      }),
    )

    col.fields.remove(col.fields.getByName('functional_impairment'))
    col.fields.add(
      new SelectField({
        name: 'functional_impairment',
        values: [
          'Sem prejuízo significativo do seu funcionamento',
          'Prejuízo do funcionamento social',
          'Prejuízo no profissional/trabalho',
        ],
        maxSelect: 1,
      }),
    )

    app.save(col)

    app
      .db()
      .newQuery(
        "UPDATE questionnaires SET appetite_weight_change = 'Sem alteração do apetite ou peso' WHERE appetite_weight_change = 'Sem alteração'",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE questionnaires SET appetite_weight_change = 'Aumento do apetite e peso' WHERE appetite_weight_change = 'Aumento'",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE questionnaires SET appetite_weight_change = 'Diminuição do apetite e peso' WHERE appetite_weight_change = 'Diminuição'",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE questionnaires SET functional_impairment = 'Sem prejuízo significativo do seu funcionamento' WHERE functional_impairment = 'Sem prejuízo'",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE questionnaires SET functional_impairment = 'Prejuízo do funcionamento social' WHERE functional_impairment = 'Social'",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE questionnaires SET functional_impairment = 'Prejuízo no profissional/trabalho' WHERE functional_impairment = 'Profissional'",
      )
      .execute()
    app
      .db()
      .newQuery(
        'UPDATE questionnaires SET improvement_areas = REPLACE(improvement_areas, \'"Energia"\', \'"Energia/disposição"\') WHERE improvement_areas LIKE \'%"Energia"%\'',
      )
      .execute()
  },
  (app) => {},
)
