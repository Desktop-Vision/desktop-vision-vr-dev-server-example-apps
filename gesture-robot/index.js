// THREE is already in the global scope
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Robot from './assets/RobotExpressive.glb'
import 'handy.js/scripts/main.min.esm'

let m = null,
  mixer,
  actions,
  clock = new THREE.Clock()

const Handy = window.Handy
window.camera = window.DVCamera

DVScene.add(new THREE.DirectionalLight(0xffffff, 1))
DVScene.add(new THREE.AmbientLight(0xffffff, 0.5))

new GLTFLoader().load(Robot, function (gltf) {
  m = gltf.scene
  DVScene.add(m)

  m.scale.setScalar(0.12)
  m.position.y += 0.8
  m.position.z -= 0.4
  m.position.x += 0.6
  m.rotateY(THREE.MathUtils.degToRad(-45))

  const { animations } = gltf

  mixer = new THREE.AnimationMixer(gltf.scene)

  actions = {}

  const states = [
    'Idle',
    'Walking',
    'Running',
    'Dance',
    'Death',
    'Sitting',
    'Standing',
  ]
  const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp']

  for (let i = 0; i < animations.length; i++) {
    const clip = animations[i]
    const action = mixer.clipAction(clip)
    actions[clip.name] = action

    if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
      action.clampWhenFinished = true
      action.loop = THREE.LoopOnce
    }
  }

  actions['Idle'].play()

  let hand0 = DVRenderer.xr.getHand(0)
  let hand1 = DVRenderer.xr.getHand(1)
  Handy.makeHandy(hand0)
  Handy.makeHandy(hand1)
  const hands = [hand0, hand1]
  hands.forEach((hand) => {
    hand.addEventListener('thumb pose began', function (event) {
      actions['ThumbsUp'].reset().play()
    })
    hand.addEventListener('peace pose began', function (event) {
      actions['Wave'].reset().play()
    })
    hand.addEventListener('fist pose began', function (event) {
      actions['Punch'].reset().play()
    })
    hand.addEventListener('love pose began', function (event) {
      actions['Jump'].reset().play()
    })
  })
})

// this function is invoked every frame via a request animation frame loop
window.DVTick = function () {
  const dt = clock.getDelta()
  if (mixer) mixer.update(dt)
  Handy.update()
}
