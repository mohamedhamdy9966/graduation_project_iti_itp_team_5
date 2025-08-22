import React from 'react'

const Sidebar = ({selectedUser, setSelectedUser}) => {
  return (
    <div>
      <div className='pb-5'>
        <div className='flex justify-between items-center'>
            <img src='' alt='logo' className='max-w-40'/>
            <div className='relative py-2 group'>
                <img src='' alt='Menu' className='max-h-5 cursor-pointer'/>
            </div>
        </div>
        <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
            <img src='' alt='search' className='w-3'/>
            <input type='text' className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' placeholder='Search Groups...'/>
        </div>
      </div>
      <div className='flex flex-col'>
        {userDummyData}
      </div>
    </div>
  )
}

export default Sidebar
