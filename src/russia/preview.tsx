import React, {FC, useEffect, useRef} from "react";
import Shape from "./shape";

interface PreviewProps {
    shape: Shape | undefined;
}

const Preview: FC<PreviewProps> = (props) => {
    const {shape} = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // set size
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
    }, [canvasRef]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx && shape) {
            ctx.clearRect(0, 0, canvas!.clientWidth, canvas!.clientHeight);
            const cellW = canvas!.width / 4;
            shape.draw(ctx, 0, 0, cellW);
        }
    }, [shape]);

    return <canvas ref={canvasRef} />
};

export default Preview;
