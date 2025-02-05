import api from "@shared/Interceptors";
import { AcordoComercialModel } from "@shared/models/AcordoComercialModel"


export const getAllAcordosComerciaisByUser = (data: AcordoComercialModel) => {
  return api.post('/acordos/ACI/getByUserAndStatus', data.data);
}
