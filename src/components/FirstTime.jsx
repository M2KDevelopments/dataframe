import { useState } from 'react'
import { useTour } from '@reactour/tour'
import tourguide from '../assets/tour.json';
import { Button, Modal } from '@mantine/core';
import { HelpCircle } from 'lucide-react';

function FirstTime() {

    const { setIsOpen, setSteps } = useTour();
    const [firstTime, setFirstTime] = useState(!window.localStorage.getItem('firsttime'));

    const onClose = () => {
        setFirstTime(false)
        window.localStorage.setItem('firsttime', 'true');
    }

    const onTour = () => {
        setIsOpen(true);
        setSteps(tourguide);
        onClose();
    }

    return (
        <Modal size="lg" opened={firstTime} onClose={onClose} title="Welcome to Data Frame">
            <img className="w-full" src="/promo.jpg"/>
            
            <p className='my-6'>Data Frame is a free open source project to quickly visualize database tables and export code to the relational database or ORM of choice</p>

            <div className='grid grid-cols-2'>
                <Button onClick={onTour} leftSection={<HelpCircle />} color="teal" radius="lg">Start Tour Guide</Button>
            </div>
        </Modal>
    )
}

export default FirstTime