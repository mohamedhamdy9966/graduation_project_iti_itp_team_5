import React, { useContext, useEffect } from 'react'
import { v4 as uuidv4 } from "uuid";
import { AdminContext } from "../../context/AdminContext";

const LabsList = () => {
  const {labs, aToken, getAllLabs, changeLabAvailability} = useContext(AdminContext);
  useEffect(()=>{
    if (aToken) {
      getAllLabs()
    }
  },[aToken])
  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll'>
      <h2 className='text-lg font-medium'>All labs</h2>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {
          labs?.map((item)=>(
            <div className='border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group' key={uuidv4()}>
              <img className='bg-indigo-50 group-hover:bg-blue-600 transition-all duration-500' src={item.image} alt='image'/>
              <div className='p-4'>
                <p className='text-neutral-800 text-lg font-medium'>{item.name}</p>
                <p className='text-zinc-600 text-sm'>{item.specialty}</p>
                <div className='mt-2 flex items-center gap-1 text-sm'>
                  <input onChange={()=> changeLabAvailability(item._id)} type='checkbox' checked={item.available}/>
                <p>Available</p>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default LabsList
