import express from 'express';
import pool from '../db/db.js';

const router = express.Router();

// POST /mensajes - Crear mensaje (validar campos)
router.post('/mensajes', async (req, res) => {
    const { canal_id, usuario_id, contenido } = req.body;
    if (!canal_id || !usuario_id || !contenido || contenido.trim() === '') {
        return res.status(400).json({ "error": "canal_id, usuario_id y contenido son obligatorios y contenido no puede estar vacío" });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO mensajes (canal_id, usuario_id, contenido) VALUES (?, ?, ?)',
            [canal_id, usuario_id, contenido]
        );
        res.status(201).json({ id: result.insertId, canal_id, usuario_id, contenido });
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar/actualizar/eliminar mensaje', details: error.message });
    }
});

// PUT /mensajes/:id - Editar mensaje (solo autor)
router.put('/mensajes/:id', async (req, res) => {
    const { id } = req.params;
    const { usuario_id, contenido } = req.body;
    if (!usuario_id || !contenido || contenido.trim() === '') {
        return res.status(400).json({ error: 'usuario_id y contenido son obligatorios y contenido no puede estar vacío' });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM mensajes WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }
        if (rows[0].usuario_id !== usuario_id) {
            return res.status(403).json({ error: 'No tienes permiso para editar este mensaje' });
        }
        await pool.query('UPDATE mensajes SET contenido = ? WHERE id = ?', [contenido, id]);
        res.json({ message: 'Mensaje actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar/actualizar/eliminar mensaje', details: error.message });
    }
});

// DELETE /mensajes/:id - Eliminar mensaje (solo autor)
router.delete('/mensajes/:id', async (req, res) => {
    const { id } = req.params;
    const { usuario_id } = req.body;
    if (!usuario_id) {
        return res.status(400).json({ error: 'usuario_id es obligatorio' });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM mensajes WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }
        if (rows[0].usuario_id !== usuario_id) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar este mensaje' });
        }
        await pool.query('DELETE FROM mensajes WHERE id = ?', [id]);
        res.json({ message: 'Mensaje eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar/actualizar/eliminar mensaje', details: error.message });
    }
});

export default router;
