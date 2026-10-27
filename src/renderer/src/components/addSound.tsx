export default function AddSound({OnClick}) : React.JSX.Element {
  return (
    <>
      <div className="add-sound" onClick={OnClick}>
        <h2>+</h2>
      </div>
    </>
  )
}