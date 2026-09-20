import RestauranteForm from '../RestauranteForm'

export default function NuevoRestaurantePage() {
  return (
    <div className="max-w-md mx-auto glass-card rounded-2xl p-6">
      <h1 className="text-lg font-semibold text-slate-900 mb-6">Crear restaurante</h1>
      <RestauranteForm />
    </div>
  )
}
