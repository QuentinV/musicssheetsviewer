import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay'

interface SheetRendererProps {
    id: string;
}

export const SheetRenderer: React.FC<SheetRendererProps> = ({ id }) => {
    const [osmd, setOsmd] = useState<OSMD|null>(null);
    const ref = useRef(null);

    useEffect(() => {
        if ( !ref.current || osmd ) {
            return;
        }
        (async () => {
            const osmd = new OSMD(ref.current as any, { autoResize: true });
            setOsmd(osmd);
            await osmd.load(`/api/sheets/${id}/book.mxl`, id);
            await osmd.render();
        })();      
    }, [ref.current, id]);
    
    return (
        <div ref={ref}></div>
    )
};