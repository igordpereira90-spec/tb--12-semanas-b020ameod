cronAdd('questionnaire_reminder', '0 9 * * *', () => {
  const scheduledWeeks = [0, 2, 4, 6, 8, 10, 12]
  const siteUrl = 'https://programa-transtorno-bipolar-12-semanas-29606.goskip.app'

  var patients = []
  try {
    patients = $app.findRecordsByFilter('users', "role = 'patient'", 'created', 0, 0)
  } catch (err) {
    $app.logger().error('reminder cron: failed to fetch patients', 'error', err.message)
    return
  }

  const notifCol = $app.findCollectionByNameOrId('notifications')
  var mailClient
  try {
    mailClient = $app.newMailClient()
  } catch (err) {
    $app.logger().error('reminder cron: failed to create mail client', 'error', err.message)
    return
  }

  for (var i = 0; i < patients.length; i++) {
    const patient = patients[i]

    var createdStr = patient.getString('created')
    if (!createdStr) continue

    var createdDate = new Date(createdStr)
    var now = new Date()
    var daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
    var currentWeek = Math.floor(daysDiff / 7)

    if (currentWeek < 0 || currentWeek > 12) continue
    if (scheduledWeeks.indexOf(currentWeek) === -1) continue

    var hasQuestionnaire = false
    try {
      var records = $app.findRecordsByFilter(
        'questionnaires',
        'patient = "' + patient.id + '" && week_number = ' + currentWeek,
        '',
        1,
        0,
      )
      hasQuestionnaire = records.length > 0
    } catch (_) {}

    if (hasQuestionnaire) continue

    var email = patient.getString('email')
    var name = patient.getString('name') || 'Paciente'

    if (!email) continue

    try {
      var message = new MailMessage()
      message.setFrom({
        name: 'Programa TB 12 Semanas',
        address: 'noreply@programa-transtorno-bipolar-12-semanas-29606.goskip.app',
      })
      message.setTo([{ address: email }])
      message.setSubject('Lembrete: Seu questionário da Semana ' + currentWeek + ' está disponível')
      message.setHtml(
        '<p>Olá ' +
          name +
          ',</p>' +
          '<p>não se esqueça de preencher o seu questionário desta semana para mantermos o acompanhamento da sua evolução no programa de 12 semanas.</p>' +
          '<p><a href="' +
          siteUrl +
          '/patient/questionnaires">Acessar questionários</a></p>',
      )
      mailClient.send(message)

      var notif = new Record(notifCol)
      notif.set('recipient', patient.id)
      notif.set('title', 'Lembrete de Questionário')
      notif.set('message', 'Lembrete enviado para o seu e-mail referente à Semana ' + currentWeek)
      notif.set('read', false)
      notif.set('type', 'info')
      $app.saveNoValidate(notif)
    } catch (err) {
      $app.logger().error('reminder email error', 'error', err.message, 'patient', patient.id)
    }
  }
})
