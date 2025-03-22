import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { SheetRenderer } from '../components/SheetRenderer';

export const SheetPage = () => {
    const navigate = useNavigate();

    return (
        <div className='flex flex-column justify-content-center p-5 text-center gap-2'>
            <h1>Sheet</h1>
            <div>
                <SheetRenderer />
            </div>
            <div>
                <Button onClick={() => navigate('/')}>Back</Button>
            </div>
        </div>
    );
};