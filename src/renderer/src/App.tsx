import { useState, useEffect } from "react"

import "./components/soundCard"
import SoundCard from "./components/soundCard"
import AddSound from "./components/addSound"

interface Sound {
  id: number;
  name: string;
  hotkey: string;
  path: string;
}

function App(): React.JSX.Element {
  const [sounds, setSounds] = useState<Sound[]>([])

  const reload = async () => setSounds(await window.electronStore.getall())

  useEffect(() => { reload() }, [])

  const addItem = async () => {
    await window.electronStore.add(Date.now(), "testesteronicboy", "", "test")
    reload()
  }

  const delItem = async (id: number) => {
    await window.electronStore.del(id)
    reload()
  }

  return (
    <main>
      <ul className="sounds-list">
        <AddSound OnClick={addItem} />
        {sounds.map((s) => (<SoundCard key={s.id} name={s.name} delFunc={() => delItem(s.id)} />))}
      </ul>
    </main>
  )
}

export default App
