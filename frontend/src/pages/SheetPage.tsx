import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { SheetRenderer } from '../components/SheetRenderer';

export const SheetPage = () => {
    const navigate = useNavigate();
    const { uuid } = useParams();
    const [sheet, setSheet] = useState<{ title: string } | null>(null);

    useEffect(() => {
        fetch(`/api/sheets/${uuid}`).then( async res => {
            setSheet(await res.json());
        });
    }, []);

    if (!uuid) {
        return <div>Invalid sheet ID</div>;
    }

    if ( !sheet ) {
        return null;
    }
    
    return (<>
        <div className='w-full h-full overflow-auto overflow-x-hidden'> 
            <SheetRenderer id={uuid} title={sheet?.title} />
        </div>
        <div className='absolute top-0 left-0 m-2'>
            <Button onClick={() => navigate('/')}>Back</Button>
        </div>
    </>);
};