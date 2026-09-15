import RestauranteForm from '../RestauranteForm'

export default function NuevoRestaurantePage() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h1 className="text-lg font-semibold text-slate-900 mb-6">Crear restaurante</h1>
      <RestauranteForm />
    </div>
  )
}
