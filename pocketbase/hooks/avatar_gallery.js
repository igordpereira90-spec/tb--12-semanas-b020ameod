routerAdd(
  'GET',
  '/backend/v1/avatar-gallery',
  (e) => {
    const db = 'https://api.dicebear.com/9.x'

    function dice(style, seed) {
      return db + '/' + style + '/png?seed=' + seed + '&size=300'
    }

    function unsplash(photoId) {
      return 'https://images.unsplash.com/photo-' + photoId + '?w=300&h=300&fit=crop'
    }

    const gallery = {
      anime: [
        { id: 'an1', url: dice('lorelei', 'tb-anime-1') },
        { id: 'an2', url: dice('lorelei', 'tb-anime-2') },
        { id: 'an3', url: dice('lorelei', 'tb-anime-3') },
        { id: 'an4', url: dice('lorelei', 'tb-anime-4') },
        { id: 'an5', url: dice('adventurer', 'tb-anime-5') },
        { id: 'an6', url: dice('adventurer', 'tb-anime-6') },
        { id: 'an7', url: dice('adventurer', 'tb-anime-7') },
        { id: 'an8', url: dice('adventurer', 'tb-anime-8') },
      ],
      profissional: [
        { id: 'pr1', url: dice('personas', 'tb-prof-1') },
        { id: 'pr2', url: dice('personas', 'tb-prof-2') },
        { id: 'pr3', url: dice('personas', 'tb-prof-3') },
        { id: 'pr4', url: dice('personas', 'tb-prof-4') },
        { id: 'pr5', url: dice('micah', 'tb-prof-5') },
        { id: 'pr6', url: dice('micah', 'tb-prof-6') },
        { id: 'pr7', url: dice('micah', 'tb-prof-7') },
        { id: 'pr8', url: dice('micah', 'tb-prof-8') },
      ],
      natureza: [
        { id: 'na1', url: unsplash('1506905925346-21bda4d32df4') },
        { id: 'na2', url: unsplash('1441974231531-c6227db76b6e') },
        { id: 'na3', url: unsplash('1505144808419-1957a94ca61e') },
        { id: 'na4', url: unsplash('1470071459604-3b5ec3a7fe05') },
        { id: 'na5', url: unsplash('1426604966848-d7adac402bff') },
        { id: 'na6', url: unsplash('1501785888041-af3ef285b470') },
        { id: 'na7', url: unsplash('1418065460487-3e41a6c84dc5') },
        { id: 'na8', url: unsplash('1518495973542-4542c06a5843') },
      ],
      minimalista: [
        { id: 'mi1', url: dice('geometric', 'tb-min-1') },
        { id: 'mi2', url: dice('geometric', 'tb-min-2') },
        { id: 'mi3', url: dice('geometric', 'tb-min-3') },
        { id: 'mi4', url: dice('geometric', 'tb-min-4') },
        { id: 'mi5', url: dice('shapes', 'tb-min-5') },
        { id: 'mi6', url: dice('shapes', 'tb-min-6') },
        { id: 'mi7', url: dice('shapes', 'tb-min-7') },
        { id: 'mi8', url: dice('shapes', 'tb-min-8') },
      ],
    }

    return e.json(200, gallery)
  },
  $apis.requireAuth(),
)
