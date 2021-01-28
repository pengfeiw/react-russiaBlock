import React, {FC, useEffect, useRef} from "react";
import "./index.less";
import Shape, {ShapeType} from "./shape";

interface RussiaBlockProps {
    canvasSizeW: number; // 画布宽度，高度自动计算
}

const RussiaBlock: FC<RussiaBlockProps> = (props) => {
    const {canvasSizeW: sizew} = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.width = `${sizew}px`;
            canvas.style.height = `${1.5 * sizew}px`;
            canvas.width = sizew;
            canvas.height = 1.5 * sizew;
        }
    }, []);

    // 测试，绘制所有图形
    useEffect(() => {
        const cellSize = sizew * 1 / 40;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const shapes = ["shapeO", "shapeI", "shapeZ", "shapeS", "shapeL", "shapeJ", "shapeT"];
        for (let i = 0; i < 7; i++) {
            const shape = new Shape(shapes[i] as ShapeType);
            for (let j = 0; j < 4; j++) {
                shape.shapeIndex = j;
                const drawY = cellSize * (i + 1) + 4 * cellSize * i;
                const drawX = cellSize * (j + 1) + 4 * cellSize * j;
                shape.draw(ctx!, drawX, drawY, cellSize);
            }
        }
    }, []);

    return (
        <div className="russia">
            <canvas className="canvas" ref={canvasRef} />
        </div>
    );
};

export default RussiaBlock;
