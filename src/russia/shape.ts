// 数组index递增方向，即block顺时针方向旋转
export const shapeO = [0x0660, 0x0660, 0x0660, 0x0660];
export const shapeI = [0x4444, 0x0F00, 0x4444, 0x0F00];
export const shapeZ = [0x0c60, 0x2640, 0x0c60, 0x2640];
export const shapeS = [0x0360, 0x4620, 0x0360, 0x4620];
export const shapeL = [0x4460, 0x0E80, 0x6220, 0x0170];
export const shapeJ = [0x2260, 0x08E0, 0x6440, 0x0710];
export const shapeT = [0x04E0, 0x4640, 0x0720, 0x2620];
export const allShape = [shapeO, shapeI, shapeZ, shapeS, shapeL, shapeJ, shapeT];

const shape = {shapeO, shapeI, shapeZ, shapeS, shapeL, shapeJ, shapeT};

export type ShapeType = keyof typeof shape;

class Shape {
    public type: ShapeType;
    public shapeIndex = 0;
    public color: string;
    public borderColor: string;
    constructor(type: ShapeType, color = "red", borderColor = "black") {
        this.type = type;
        this.color = color;
        this.borderColor = borderColor;
    }
    public get shapeValue(): number {
        return shape[this.type][this.shapeIndex];
    }

    /**
     * 绘制当前图形
     * @param ctx CanvasRenderingContext2D对象
     * @param ltx block当前的左上角坐标X
     * @param lty block当前的左上角坐标Y
     * @param cellW 一格cell的宽度
     */
    public draw(ctx: CanvasRenderingContext2D, ltx: number, lty: number, cellW: number): void {
        ctx.strokeStyle = this.borderColor;
        ctx.fillStyle = this.color;
        let value = this.shapeValue;
        for (let i = 0; i < 16; i++) {
            const andOpRes = value & 0x8000;
            if (andOpRes === 0x8000) {
                const row = parseInt((i / 4).toString());
                const col = i % 4;
                ctx.beginPath();
                ctx.strokeRect(ltx + col * cellW, lty + row * cellW, cellW, cellW);
                ctx.fillRect(ltx + col * cellW, lty + row * cellW, cellW, cellW);
                ctx.closePath();
            }
            value = value << 1;
        }
    }

    /**
     * 清除当前图形
     * @param ctx CanvasRenderingContext2D对象
     * @param ltx block当前的左上角坐标X
     * @param lty block当前的左上角坐标Y
     * @param cellW 一格cell的宽度
     */
    public clear(ctx: CanvasRenderingContext2D, ltx: number, lty: number, cellW: number): void {
        let value = this.shapeValue;
        for (let i = 0; i < 16; i++) {
            const andOpRes = value & 0x8000;
            if (andOpRes === 0x8000) {
                const row = parseInt((i / 4).toString());
                const col = i % 4;
                ctx.clearRect(ltx + col * cellW - 1, lty + row * cellW - 1, cellW + 2, cellW + 2);
            }
            value = value << 1;
        }
    }
}
export default Shape;
