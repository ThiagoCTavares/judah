const tasks = [
  'Organizar a agenda da semana',
  'Revisar metas do trimestre',
  'Planejar bloco de foco da tarde',
  'Enviar resumo do dia',
]

function FocusScreen() {
  return (
    <div className="mx-auto w-full max-w-md">
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task}>
            <label className="flex items-center gap-3 text-sm text-zinc-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
              />
              <span className="leading-tight">{task}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FocusScreen
