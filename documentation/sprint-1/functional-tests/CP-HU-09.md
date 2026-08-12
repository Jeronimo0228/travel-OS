# HU-09: Tareas y recordatorios

**Issue:** #9  
**Historia:** Tareas y recordatorios

## Criterios de aceptación

### AC-01
- **Dado** un asesor con un lead
- **Cuando** crea una tarea con fecha
- **Entonces** la tarea queda asociada al lead y aparece en su lista

### AC-02
- **Dado** una tarea pendiente
- **Cuando** la marca como hecha
- **Entonces** cambia de estado

### AC-03
- **Dado** tareas vencidas
- **Cuando** consulta recordatorios
- **Entonces** se destacan o listan según regla acordada

## Casos de prueba

### CP-09-01 — Crear tarea
- **AC relacionado:** AC-01
- **Precondiciones:** Lead existe
- **Pasos:** Nueva tarea + due date
- **Resultado esperado:** Tarea ligada al lead
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-09-02 — Completar tarea
- **AC relacionado:** AC-02
- **Precondiciones:** Tarea pending
- **Pasos:** Marcar done
- **Resultado esperado:** Estado done
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

### CP-09-03 — Recordatorio vencido
- **AC relacionado:** AC-03
- **Precondiciones:** Tarea due_date pasado
- **Pasos:** Abrir listado recordatorios
- **Resultado esperado:** Aparece como vencida/urgente
- **Resultado ejecución:** ⏳ Pendiente (tras implementación)

