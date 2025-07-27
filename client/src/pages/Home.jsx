import React from 'react'
import TopDoctors from '../components/TopDoctors'
import Header from '../components/Header'
import DoctorSpecialty from '../components/DoctorSpecialty'

const Home = () => {
  return (
    <div className="space-y-60">
      <Header/>
      < DoctorSpecialty/>
      <TopDoctors/>
    </div>
  )
}

export default Home
