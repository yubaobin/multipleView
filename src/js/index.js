import '../styles/index.scss'

const p = new Promise(resolve => {
  resolve(123)
})
p.then(res => {
  console.log(res)
})