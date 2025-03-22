import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { SheetRenderer } from '../components/SheetRenderer';

export const SheetPage = () => {
    const navigate = useNavigate();
    const { uuid } = useParams();

    if (!uuid) {
        return <div>Invalid sheet ID</div>;
    }
    
    return (<>
        <div className='w-full h-full overflow-auto overflow-x-hidden'> 
            <SheetRenderer id={uuid} />
        </div>
        <div className='absolute top-0 left-0 m-2'>
            <Button onClick={() => navigate('/')}>Back</Button>
        </div>
    </>);
};