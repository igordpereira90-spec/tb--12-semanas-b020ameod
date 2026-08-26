onBootstrap((e) => {
  e.next()
  try {
    const email = 'igordpereira90@gmail.com'
    const password = 'Skip@Pass'
    let userRecord = null

    try {
      userRecord = $app.findAuthRecordByEmail('users', email)
      userRecord.setPassword(password)
      userRecord.setVerified(true)
      userRecord.set('role', 'professional')
      if (!userRecord.getString('name')) {
        userRecord.set('name', 'Dr. Igor Pereira')
      }
      $app.save(userRecord)
    } catch (_) {
      try {
        const usersCol = $app.findCollectionByNameOrId('users')
        userRecord = new Record(usersCol)
        userRecord.setEmail(email)
        userRecord.setPassword(password)
        userRecord.setVerified(true)
        userRecord.set('name', 'Dr. Igor Pereira')
        userRecord.set('role', 'professional')
        userRecord.set('points', 0)
        userRecord.set('badges', { earnedBadges: [], readMaterials: [] })
        userRecord.set('consent_accepted', true)
        $app.save(userRecord)
      } catch (err) {
        $app.logger().error('onBootstrap ensure professional user failed: ' + err.toString())
      }
    }
  } catch (err) {
    $app.logger().error('onBootstrap error: ' + err.toString())
  }
})

routerAdd('POST', '/backend/v1/ensure-user', (e) => {
  const email = 'igordpereira90@gmail.com'
  const password = 'Skip@Pass'
  let userRecord = null
  let status = 'updated'

  try {
    userRecord = $app.findAuthRecordByEmail('users', email)
    userRecord.setPassword(password)
    userRecord.setVerified(true)
    userRecord.set('role', 'professional')
    if (!userRecord.getString('name')) {
      userRecord.set('name', 'Dr. Igor Pereira')
    }
    $app.save(userRecord)
  } catch (_) {
    try {
      const usersCol = $app.findCollectionByNameOrId('users')
      userRecord = new Record(usersCol)
      userRecord.setEmail(email)
      userRecord.setPassword(password)
      userRecord.setVerified(true)
      userRecord.set('name', 'Dr. Igor Pereira')
      userRecord.set('role', 'professional')
      userRecord.set('points', 0)
      userRecord.set('badges', { earnedBadges: [], readMaterials: [] })
      userRecord.set('consent_accepted', true)
      $app.save(userRecord)
      status = 'created'
    } catch (err) {
      return e.json(500, { error: err.toString() })
    }
  }

  return e.json(200, {
    success: true,
    status: status,
    email: email,
    role: 'professional',
  })
})

routerAdd('GET', '/backend/v1/ensure-user', (e) => {
  const email = 'igordpereira90@gmail.com'
  const password = 'Skip@Pass'
  let userRecord = null
  let status = 'updated'

  try {
    userRecord = $app.findAuthRecordByEmail('users', email)
    userRecord.setPassword(password)
    userRecord.setVerified(true)
    userRecord.set('role', 'professional')
    if (!userRecord.getString('name')) {
      userRecord.set('name', 'Dr. Igor Pereira')
    }
    $app.save(userRecord)
  } catch (_) {
    try {
      const usersCol = $app.findCollectionByNameOrId('users')
      userRecord = new Record(usersCol)
      userRecord.setEmail(email)
      userRecord.setPassword(password)
      userRecord.setVerified(true)
      userRecord.set('name', 'Dr. Igor Pereira')
      userRecord.set('role', 'professional')
      userRecord.set('points', 0)
      userRecord.set('badges', { earnedBadges: [], readMaterials: [] })
      userRecord.set('consent_accepted', true)
      $app.save(userRecord)
      status = 'created'
    } catch (err) {
      return e.json(500, { error: err.toString() })
    }
  }

  return e.json(200, {
    success: true,
    status: status,
    email: email,
    role: 'professional',
  })
})
