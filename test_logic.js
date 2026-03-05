// Mock del estado
const pieces = [
    { nombre: 'P1', w: 1000, h: 500 },
    { nombre: 'P2', w: 800, h: 600 },
    { nombre: 'P3', w: 2000, h: 1000 }
];
const p_w = 3600;
const p_h = 2600;
const stock_qty = 10;

// Logica de optimización con manejo de errores y rotación
function testOptimize() {
    console.log("--- INICIANDO TEST DE OPTIMIZACIÓN ---");
    
    // 1. Error: Dimensiones inválidas
    if (!p_w || !p_h || p_w <= 0 || p_h <= 0) {
        return console.error("ERROR: Dimensiones del panel de stock inválidas.");
    }

    const sortedPieces = [...pieces].sort((a, b) => b.h - a.h);
    const panelsUsed = [];
    let currentPieces = [...sortedPieces];

    while(currentPieces.length > 0 && panelsUsed.length < stock_qty) {
        const panel = { w: p_w, h: p_h, layouts: [] };
        let shelf_y = 0;
        let shelf_h = 0;
        let shelf_x = 0;
        let remaining = [];
        
        for(let piece of currentPieces) {
            let pw = piece.w;
            let ph = piece.h;
            let rotated = false;

            // 2. Error: Pieza no cabe ni rotada
            const fitsOriginal = (pw <= panel.w && ph <= panel.h);
            const fitsRotated = (ph <= panel.w && pw <= panel.h);

            if (!fitsOriginal && !fitsRotated) {
                console.warn(`PIEZA DESCARTADA: '${piece.nombre}' (${pw}x${ph}) es más grande que el panel (${panel.w}x${panel.h})`);
                continue;
            }

            // Lógica de Rotación Automática:
            // Si no cabe original pero sí rotada, rotamos.
            // O si rotada usa menos espacio vertical (ph es menor que pw), rotamos.
            if (!fitsOriginal && fitsRotated) {
                [pw, ph] = [ph, pw];
                rotated = true;
            } else if (fitsOriginal && fitsRotated && ph > pw) {
                // Preferimos que la dimensión menor sea la altura para maximizar el estante
                [pw, ph] = [ph, pw];
                rotated = true;
            }

            // Cabe en shelf actual?
            if (shelf_x + pw > panel.w) {
                shelf_y += shelf_h;
                shelf_x = 0;
                shelf_h = 0;
            }

            if (shelf_y + ph <= panel.h) {
                panel.layouts.push({ x: shelf_x, y: shelf_y, w: pw, h: ph, nombre: piece.nombre + (rotated ? ' (R)' : '') });
                shelf_x += pw;
                shelf_h = Math.max(shelf_h, ph);
                console.log(`PIEZA COLOCADA: ${piece.nombre}${rotated?' (ROTADA)':''} en x:${panel.layouts[panel.layouts.length-1].x}, y:${shelf_y}`);
            } else {
                remaining.push(piece);
            }
        }
        panelsUsed.push(panel);
        currentPieces = remaining;
        
        if (currentPieces.length > 0 && panelsUsed.length >= stock_qty) {
            console.error("LIMITE DE STOCK ALCANZADO: Faltaron piezas por optimizar.");
        }
    }
    console.log(`--- TEST FINALIZADO: Paneles usados: ${panelsUsed.length} ---`);
}

testOptimize();
