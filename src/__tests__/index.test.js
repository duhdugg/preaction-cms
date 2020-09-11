test('index.js', async () => {
  const root = document.createElement('div')
  root.id = 'root'
  document.body.appendChild(root)
  await import('../index.js')
})
