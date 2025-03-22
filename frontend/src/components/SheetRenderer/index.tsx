import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay'

export const SheetRenderer = () => {
    const [osmd, setOsmd] = useState<OSMD|null>(null);
    const ref = useRef(null);

    useEffect(() => {
        if ( !ref.current ) {
            return;
        }
        (async () => {
            const osmd = new OSMD(ref.current as any, { autoResize: false });
            await osmd.load('/0.mxl', 'My title');
            await osmd.render();
            setOsmd(osmd);
        })();      
    }, [ref.current]);
    
    return (
        <div ref={ref}></div>
    )
};