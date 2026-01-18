import React from 'react'

function NavBar({projectname}) {
    
    return (
        <header className='w-full h-20'>
            <nav className='flex gap-3'>
                <span>{projectname}</span>
            </nav>
        </header>
    )
}

export default NavBar