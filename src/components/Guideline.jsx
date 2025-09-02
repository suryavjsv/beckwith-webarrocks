import guidelineImage from '../assets/images/guideline_lighter.webp'


const Guideline = (props) => {
  return (

    <div className='guideLineModal'>
      <div className='guideLineContent'>
        <img src={guidelineImage} className='guideLineImage'/>
        <div className='guideLineText'>
        Please show a BeckWith Model.<br/>Do not hide it partially with your hand.<br/>Magic will happen 🪄.
        </div>
        <button className='guideLineCloseButton' onClick={props.onClose}>Hide instructions</button>
      </div>
    </div>
  )
}

export default Guideline
