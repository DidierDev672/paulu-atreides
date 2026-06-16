<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '@/presentation/stores/authStore'
import { createCompany, getErrorMessage } from '@/application/services/companyService'
import { createMainAddress } from '@/application/services/mainAddressService'
import { createTaxInformation } from '@/application/services/taxInformationService'
import { createEconomicActivity } from '@/application/services/economicActivityService'

const emit = defineEmits<{
  created: []
  cancel: []
}>()

/* ─── Stores ─────────────────────────────────────────────────────────────── */
const authStore = useAuthStore()

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Step {
  id: number
  title: string
  description: string
}

interface CompanyForm {
  /* Step 1 — Información básica */
  nit: string
  razonSocial: string
  nombreComercial: string
  tipoPersona: string
  tipoEmpresa: string
  estado: string
  fechaConstitucion: string

  /* Step 2 — Contacto */
  correo: string
  telefono: string
  celular: string

  /* Step 3 — Dirección principal */
  pais: string
  departamento: string
  municipio: string
  direccion: string
  codigoPostal: string

  /* Step 4 — Tributaria */
  regimenTributario: string
  responsableIva: boolean
  autoretenedor: boolean
  granContribuyente: boolean

  /* Step 6 — Actividades económicas */
  actividadesEconomicas: { codigo: string; descripcion: string }[]
}

/* ─── Reactive state ─────────────────────────────────────────────────────── */
const currentStep = ref(0)
const submitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref<string | null>(null)

const formData = reactive<CompanyForm>({
  nit: '',
  razonSocial: '',
  nombreComercial: '',
  tipoPersona: '',
  tipoEmpresa: '',
  estado: '',
  fechaConstitucion: '',
  correo: '',
  telefono: '',
  celular: '',
  pais: '',
  departamento: '',
  municipio: '',
  direccion: '',
  codigoPostal: '',
  regimenTributario: '',
  responsableIva: false,
  autoretenedor: false,
  granContribuyente: false,
  actividadesEconomicas: [{ codigo: '', descripcion: '' }],
})

/* ─── Step definitions ───────────────────────────────────────────────────── */
const steps: Step[] = [
  { id: 1, title: 'Información básica', description: 'Datos legales de la empresa' },
  { id: 2, title: 'Contacto', description: 'Medios de comunicación' },
  { id: 3, title: 'Dirección principal', description: 'Ubicación del domicilio' },
  { id: 4, title: 'Tributaria', description: 'Régimen y obligaciones fiscales' },
  { id: 5, title: 'Representante legal', description: 'Datos del usuario actual' },
  { id: 6, title: 'Actividades económicas', description: 'Códigos CIIU (opcional)' },
]

const totalSteps = computed(() => steps.length)
const isFirstStep = computed(() => currentStep.value === 0)
const isLastStep = computed(() => currentStep.value === totalSteps.value - 1)

/* ─── Validation per step ────────────────────────────────────────────────── */
const stepValidators: Record<number, () => boolean> = {
  0: () =>
    Boolean(
      formData.nit.trim() &&
        formData.razonSocial.trim() &&
        formData.nombreComercial.trim() &&
        formData.tipoPersona.trim() &&
        formData.tipoEmpresa.trim() &&
        formData.estado.trim() &&
        formData.fechaConstitucion.trim(),
    ),
  1: () => Boolean(formData.correo.trim() && formData.telefono.trim()),
  2: () =>
    Boolean(
      formData.pais.trim() &&
        formData.departamento.trim() &&
        formData.municipio.trim() &&
        formData.direccion.trim() &&
        formData.codigoPostal.trim(),
    ),
  3: () => Boolean(formData.regimenTributario.trim()),
  4: () => true,
  5: () => true,
}

const isStepValid = computed(() => stepValidators[currentStep.value]?.() ?? false)

/* ─── Navigation ─────────────────────────────────────────────────────────── */
function nextStep(): void {
  if (isLastStep.value) return
  if (!isStepValid.value) return
  currentStep.value++
}

function prevStep(): void {
  if (isFirstStep.value) return
  currentStep.value--
}

function goToStep(index: number): void {
  if (index < currentStep.value) {
    currentStep.value = index
    return
  }
  for (let i = currentStep.value; i < index; i++) {
    if (!stepValidators[i]?.()) return
  }
  currentStep.value = index
}

/* ─── Actividades económicas helpers ─────────────────────────────────────── */
function addActividad(): void {
  formData.actividadesEconomicas.push({ codigo: '', descripcion: '' })
}

function removeActividad(index: number): void {
  if (formData.actividadesEconomicas.length > 1) {
    formData.actividadesEconomicas.splice(index, 1)
  }
}

/* ─── Submit ─────────────────────────────────────────────────────────────── */
async function submitForm(): Promise<void> {
  submitting.value = true
  submitError.value = null

  const user = authStore.session?.user
  if (!user) {
    submitError.value = 'Debes iniciar sesión para registrar una empresa.'
    submitting.value = false
    return
  }

  try {
    const company = await createCompany({
      user_id: user.id,
      nit: formData.nit,
      social_reason: formData.razonSocial,
      business_name: formData.nombreComercial,
      type_person: formData.tipoPersona,
      company_type: formData.tipoEmpresa,
      status: formData.estado,
      constitution_date: formData.fechaConstitucion,
      email: formData.correo,
      phone: formData.telefono,
      cellphone: formData.celular,
    })

    await Promise.all([
      createMainAddress({
        user_id: user.id,
        company_id: company.id,
        country: formData.pais,
        department: formData.departamento,
        municipio: formData.municipio,
        address: formData.direccion,
        postcode: formData.codigoPostal,
      }),
      createTaxInformation({
        user_id: user.id,
        business_id: company.id,
        tax_regime: formData.regimenTributario,
        vat_responsible: formData.responsableIva,
        withholding_taxpayer: formData.autoretenedor,
        large_taxpayer: formData.granContribuyente,
      }),
      ...formData.actividadesEconomicas
        .filter((a) => a.codigo.trim() || a.descripcion.trim())
        .map((a) =>
          createEconomicActivity({
            user_id: user.id,
            company_id: company.id,
            code: a.codigo,
            description: a.descripcion,
          }),
        ),
    ])

    submitSuccess.value = true
    emit('created')
  } catch (err) {
    submitError.value = getErrorMessage(err)
  } finally {
    submitting.value = false
  }
}

/* ─── UI helpers ─────────────────────────────────────────────────────────── */

</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 24 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
    class="mx-auto w-full max-w-2xl"
  >
    <!-- Stepper ------------------------------------------------------------- -->
    <div class="mb-10">
      <ol class="flex items-center justify-between">
        <li
          v-for="(step, index) in steps"
          :key="step.id"
          class="flex items-center"
          :class="index < totalSteps - 1 ? 'flex-1' : ''"
        >
          <button
            type="button"
            :disabled="index > currentStep && !stepValidators[currentStep]?.()"
            class="group flex items-center gap-2 text-left"
            @click="goToStep(index)"
          >
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition"
              :class="
                index < currentStep
                  ? 'bg-gradient-to-r from-stellar-500 to-cosmic-500 text-white shadow-md'
                  : index === currentStep
                    ? 'border-2 border-stellar-400 bg-stellar-500/20 text-stellar-300'
                    : 'border border-white/15 bg-white/5 text-white/35'
              "
            >
              <svg
                v-if="index < currentStep"
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span v-else>{{ step.id }}</span>
            </span>
            <span class="hidden sm:block">
              <span
                class="text-xs font-semibold uppercase tracking-wider"
                :class="
                  index <= currentStep ? 'text-white' : 'text-white/30'
                "
              >{{ step.title }}</span>
            </span>
          </button>
          <div
            v-if="index < totalSteps - 1"
            class="mx-3 h-px flex-1 transition"
            :class="index < currentStep ? 'bg-stellar-500' : 'bg-white/10'"
          />
        </li>
      </ol>
    </div>

    <!── Steps content ─────────────────────────────────────────────────────── -->
    <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-lg backdrop-blur-xl sm:p-8">
      <!-- Step 1: Información básica -->
      <div v-if="currentStep === 0" v-motion :initial="{ opacity: 0, x: 16 }" :enter="{ opacity: 1, x: 0 }">
        <h2 class="font-display text-xl font-semibold text-white">Información básica</h2>
        <p class="mt-1 text-sm text-white/45">Datos legales de la empresa</p>

        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="nit">NIT *</label>
            <input id="nit" v-model="formData.nit" type="text" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40" :class="formData.nit.trim() ? 'border-white/10' : 'border-red-400/50'" placeholder="900123456-7" />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="razonSocial">Razón social *</label>
            <input id="razonSocial" v-model="formData.razonSocial" type="text" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40" :class="formData.razonSocial.trim() ? 'border-white/10' : 'border-red-400/50'" placeholder="Empresa S.A.S." />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="nombreComercial">Nombre comercial *</label>
            <input id="nombreComercial" v-model="formData.nombreComercial" type="text" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40" :class="formData.nombreComercial.trim() ? 'border-white/10' : 'border-red-400/50'" placeholder="Paulu" />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="tipoPersona">Tipo de persona *</label>
            <select id="tipoPersona" v-model="formData.tipoPersona" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40 appearance-none" :class="formData.tipoPersona ? 'border-white/10' : 'border-red-400/50'">
              <option value="" disabled class="bg-[#0b0820]">Seleccionar</option>
              <option value="natural" class="bg-[#0b0820]">Persona natural</option>
              <option value="juridica" class="bg-[#0b0820]">Persona jurídica</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="tipoEmpresa">Tipo de empresa *</label>
            <select id="tipoEmpresa" v-model="formData.tipoEmpresa" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40 appearance-none" :class="formData.tipoEmpresa ? 'border-white/10' : 'border-red-400/50'">
              <option value="" disabled class="bg-[#0b0820]">Seleccionar</option>
              <option value="micro" class="bg-[#0b0820]">Microempresa</option>
              <option value="pequena" class="bg-[#0b0820]">Pequeña empresa</option>
              <option value="mediana" class="bg-[#0b0820]">Mediana empresa</option>
              <option value="grande" class="bg-[#0b0820]">Gran empresa</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="estado">Estado *</label>
            <select id="estado" v-model="formData.estado" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40 appearance-none" :class="formData.estado ? 'border-white/10' : 'border-red-400/50'">
              <option value="" disabled class="bg-[#0b0820]">Seleccionar</option>
              <option value="activo" class="bg-[#0b0820]">Activo</option>
              <option value="inactivo" class="bg-[#0b0820]">Inactivo</option>
              <option value="suspendido" class="bg-[#0b0820]">Suspendido</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="fechaConstitucion">Fecha de constitución *</label>
            <input id="fechaConstitucion" v-model="formData.fechaConstitucion" type="date" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40" :class="formData.fechaConstitucion ? 'border-white/10' : 'border-red-400/50'" />
          </div>
        </div>
      </div>

      <!-- Step 2: Contacto -->
      <div v-else-if="currentStep === 1" v-motion :initial="{ opacity: 0, x: 16 }" :enter="{ opacity: 1, x: 0 }">
        <h2 class="font-display text-xl font-semibold text-white">Información de contacto</h2>
        <p class="mt-1 text-sm text-white/45">Medios de comunicación de la empresa</p>

        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="contacto-correo">Correo electrónico *</label>
            <input id="contacto-correo" v-model="formData.correo" type="email" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40" :class="formData.correo.trim() ? 'border-white/10' : 'border-red-400/50'" placeholder="empresa@ejemplo.com" />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="telefono">Teléfono *</label>
            <input id="telefono" v-model="formData.telefono" type="tel" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40" :class="formData.telefono.trim() ? 'border-white/10' : 'border-red-400/50'" placeholder="+57 601 234 5678" />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="celular">Celular</label>
            <input id="celular" v-model="formData.celular" type="tel" class="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40" placeholder="+57 300 123 4567" />
          </div>
        </div>
      </div>

      <!-- Step 3: Dirección principal -->
      <div v-else-if="currentStep === 2" v-motion :initial="{ opacity: 0, x: 16 }" :enter="{ opacity: 1, x: 0 }">
        <h2 class="font-display text-xl font-semibold text-white">Dirección principal</h2>
        <p class="mt-1 text-sm text-white/45">Ubicación del domicilio de la empresa</p>

        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="pais">País *</label>
            <input id="pais" v-model="formData.pais" type="text" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40" :class="formData.pais.trim() ? 'border-white/10' : 'border-red-400/50'" placeholder="Colombia" />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="departamento">Departamento *</label>
            <input id="departamento" v-model="formData.departamento" type="text" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40" :class="formData.departamento.trim() ? 'border-white/10' : 'border-red-400/50'" placeholder="Cundinamarca" />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="municipio">Municipio *</label>
            <input id="municipio" v-model="formData.municipio" type="text" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40" :class="formData.municipio.trim() ? 'border-white/10' : 'border-red-400/50'" placeholder="Bogotá D.C." />
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="codigoPostal">Código postal *</label>
            <input id="codigoPostal" v-model="formData.codigoPostal" type="text" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40" :class="formData.codigoPostal.trim() ? 'border-white/10' : 'border-red-400/50'" placeholder="110111" />
          </div>

          <div class="sm:col-span-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="direccion">Dirección *</label>
            <input id="direccion" v-model="formData.direccion" type="text" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40" :class="formData.direccion.trim() ? 'border-white/10' : 'border-red-400/50'" placeholder="Cra 9 # 15-23, Oficina 402" />
          </div>
        </div>
      </div>

      <!-- Step 4: Tributaria -->
      <div v-else-if="currentStep === 3" v-motion :initial="{ opacity: 0, x: 16 }" :enter="{ opacity: 1, x: 0 }">
        <h2 class="font-display text-xl font-semibold text-white">Información tributaria</h2>
        <p class="mt-1 text-sm text-white/45">Régimen y obligaciones fiscales</p>

        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45" for="regimenTributario">Régimen tributario *</label>
            <select id="regimenTributario" v-model="formData.regimenTributario" class="mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40 appearance-none" :class="formData.regimenTributario ? 'border-white/10' : 'border-red-400/50'">
              <option value="" disabled class="bg-[#0b0820]">Seleccionar</option>
              <option value="simplificado" class="bg-[#0b0820]">Régimen simplificado</option>
              <option value="comun" class="bg-[#0b0820]">Régimen común</option>
              <option value="gran-contribuyente" class="bg-[#0b0820]">Gran contribuyente</option>
            </select>
          </div>

          <div class="sm:col-span-2">
            <fieldset class="flex flex-wrap gap-6">
              <label class="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                <input v-model="formData.responsableIva" type="checkbox" class="h-4 w-4 rounded border-white/20 bg-white/5 text-stellar-500 accent-stellar-500" />
                Responsable de IVA
              </label>
              <label class="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                <input v-model="formData.autoretenedor" type="checkbox" class="h-4 w-4 rounded border-white/20 bg-white/5 text-stellar-500 accent-stellar-500" />
                Autoretenedor
              </label>
              <label class="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                <input v-model="formData.granContribuyente" type="checkbox" class="h-4 w-4 rounded border-white/20 bg-white/5 text-stellar-500 accent-stellar-500" />
                Gran contribuyente
              </label>
            </fieldset>
          </div>
        </div>
      </div>

      <!-- Step 5: Representante legal -->
      <div v-else-if="currentStep === 4" v-motion :initial="{ opacity: 0, x: 16 }" :enter="{ opacity: 1, x: 0 }">
        <h2 class="font-display text-xl font-semibold text-white">Representante legal</h2>
        <p class="mt-1 text-sm text-white/45">Información del usuario que inició sesión</p>

        <div v-if="authStore.session?.user" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45">ID de usuario</label>
            <p class="mt-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/60">{{ authStore.session.user.id }}</p>
          </div>
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45">Nombre completo</label>
            <p class="mt-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white">{{ authStore.session.user.fullName }}</p>
          </div>
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45">Correo electrónico</label>
            <p class="mt-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white">{{ authStore.session.user.email }}</p>
          </div>
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45">Teléfono</label>
            <p class="mt-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white">{{ authStore.session.user.phoneNumber }}</p>
          </div>
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45">Número de identificación</label>
            <p class="mt-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white">{{ authStore.session.user.idNumber }}</p>
          </div>
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-white/45">Fecha de nacimiento</label>
            <p class="mt-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white">{{ authStore.session.user.dateOfBirth }}</p>
          </div>
        </div>
        <div v-else class="mt-6 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3">
          <p class="text-sm text-gold">Debes iniciar sesión para registrar una empresa.</p>
        </div>
      </div>

      <!-- Step 6: Actividades económicas -->
      <div v-else-if="currentStep === 5" v-motion :initial="{ opacity: 0, x: 16 }" :enter="{ opacity: 1, x: 0 }">
        <h2 class="font-display text-xl font-semibold text-white">Actividades económicas</h2>
        <p class="mt-1 text-sm text-white/45">Códigos CIIU — <span class="italic text-white/30">opcional</span></p>

        <div class="mt-6 space-y-3">
          <div
            v-for="(actividad, index) in formData.actividadesEconomicas"
            :key="index"
            class="flex items-start gap-3"
          >
            <div class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                v-model="actividad.codigo"
                type="text"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40"
                placeholder="Código CIIU"
              />
              <input
                v-model="actividad.descripcion"
                type="text"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-stellar-400 focus:ring-1 focus:ring-stellar-400/40"
                placeholder="Descripción"
              />
            </div>
            <button
              type="button"
              class="mt-1 shrink-0 rounded-lg p-1.5 text-white/30 transition hover:bg-white/10 hover:text-red-300"
              :disabled="formData.actividadesEconomicas.length === 1"
              @click="removeActividad(index)"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/40 transition hover:border-stellar-400/50 hover:text-stellar-300"
            @click="addActividad"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" d="M12 5v14M5 12h14" />
            </svg>
            Añadir actividad
          </button>
        </div>
      </div>

      <!-- Navigation buttons -->
      <div class="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
        <button
          v-if="!isFirstStep"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/60 transition hover:border-white/20 hover:text-white"
          @click="prevStep"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5m7-7-7 7 7 7" />
          </svg>
          Atrás
        </button>
        <div v-else />

        <button
          v-if="!isLastStep"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-stellar-400 hover:to-cosmic-400 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!isStepValid"
          @click="nextStep"
        >
          Siguiente
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </button>

        <button
          v-else
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-emerald-400 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="submitting"
          @click="submitForm"
        >
          <svg v-if="submitting" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <template v-else>Enviar</template>
        </button>
      </div>
    </div>

    <!-- Error banner -->
    <div
      v-if="submitError"
      v-motion
      :initial="{ opacity: 0, y: 16 }"
      :enter="{ opacity: 1, y: 0 }"
      class="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-5 py-4 text-center"
    >
      <p class="text-sm font-semibold text-red-200">{{ submitError }}</p>
    </div>

    <!-- Success banner -->
    <div
      v-if="submitSuccess"
      v-motion
      :initial="{ opacity: 0, y: 16 }"
      :enter="{ opacity: 1, y: 0 }"
      class="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-4 text-center"
    >
      <p class="text-sm font-semibold text-emerald-200">Empresa registrada exitosamente</p>
    </div>
  </div>
</template>
