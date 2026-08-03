<script setup lang="ts">
defineProps<{
  headers: string[]
  rows: string[][]
}>()
</script>

<template>
  <div class="stock-html-table-wrap" role="region" aria-label="Tabla de resultados">
    <table class="stock-html-table">
      <thead>
        <tr>
          <th v-for="(header, index) in headers" :key="`h-${index}`" scope="col">
            {{ header || `Columna ${index + 1}` }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="`r-${rowIndex}`">
          <td v-for="(cell, cellIndex) in row" :key="`c-${rowIndex}-${cellIndex}`">
            {{ cell }}
          </td>
          <!-- Fill missing cells to keep alignment -->
          <td
            v-for="pad in Math.max(headers.length - row.length, 0)"
            :key="`pad-${rowIndex}-${pad}`"
          />
        </tr>
        <tr v-if="rows.length === 0">
          <td :colspan="Math.max(headers.length, 1)" class="stock-html-table-empty">
            Sin filas para mostrar
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.stock-html-table-wrap {
  width: 100%;
  overflow-x: auto;
  margin: 0.65rem 0;
  border-radius: 0.75rem;
  border: 1px solid rgb(226 232 240);
  background: #fff;
}

:global(.dark) .stock-html-table-wrap {
  border-color: rgb(226 232 240);
  background: #fff;
}

.stock-html-table {
  width: 100%;
  min-width: 320px;
  border-collapse: collapse;
  font-size: 0.78rem;
  line-height: 1.35;
  color: #000;
}

.stock-html-table thead {
  background: rgb(241 245 249);
}

:global(.dark) .stock-html-table thead {
  background: rgb(241 245 249);
}

.stock-html-table th,
.stock-html-table td {
  padding: 0.5rem 0.7rem;
  text-align: left;
  border-bottom: 1px solid rgb(226 232 240);
  white-space: nowrap;
  vertical-align: top;
  color: #000;
}

:global(.dark) .stock-html-table th,
:global(.dark) .stock-html-table td {
  border-bottom-color: rgb(203 213 225);
  color: #000;
}

.stock-html-table th {
  font-weight: 650;
  color: #000;
}

:global(.dark) .stock-html-table th {
  color: #000;
}

.stock-html-table tbody tr:hover {
  background: rgb(248 250 252);
}

:global(.dark) .stock-html-table tbody tr:hover {
  background: rgb(30 41 59 / 0.65);
}

.stock-html-table-empty {
  text-align: center;
  color: #000;
  white-space: normal;
}
</style>
