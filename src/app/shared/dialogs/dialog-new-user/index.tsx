/* eslint-disable @typescript-eslint/no-explicit-any */
import { Checkbox, InputAdornment, TextField } from "@mui/material";
import { Button, message, Typography } from "antd";
import React, { useContext, useEffect, useState } from "react";
import "./dialog.style.css";
import style from "./style.module.css";
import { RuleModel } from "@shared/models/RuleModel.ts";
import { getRules } from "@shared/services/RuleService.ts";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PiCopySimpleLight } from "react-icons/pi";
import { TfiReload } from "react-icons/tfi";
import InputMask from "react-input-mask";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  createUser,
  CreateUserRequest,
  updateUser,
  UpdateUserRequest,
} from "@shared/services/UserService";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";

interface DataType {
  cigamCode: string;
  companyName: string;
  phone: string;
  cnpj: string;
  key: string;
  id: string;
  age: string;
  status: boolean;
  email: string;
  create: string;
  frete: boolean;
  lastAlteration: string;
  userRole: string;
}

interface DialogUserRegistrationProps {
  closeModal: () => void;
  onSearch: () => void;
  selectedUser: DataType | null;
  selectedUserActionCreation: boolean;
}

const DialogUserRegistration: React.FC<DialogUserRegistrationProps> = ({
  closeModal,
  onSearch,
  selectedUser,
  selectedUserActionCreation,
}) => {
  const [rule, setRule] = useState<RuleModel[] | null>(null);
  const [selectedProfile, setSelectedProfile] = useState("");
  const generatePassword = () => Math.random().toString(36).slice(-8);
  const context = useContext(AuthContext);

  const formik = useFormik({
    initialValues: {
      cnpj: selectedUser ? selectedUser.cnpj : "",
      cigamCode: selectedUser ? selectedUser.cigamCode : "",
      companyName: selectedUser ? selectedUser.companyName : "",
      phone: selectedUser ? selectedUser.phone : "",
      email: selectedUser ? selectedUser.email : "",
      password: selectedUserActionCreation ? generatePassword() : "",
      frete: selectedUser ? selectedUser.frete : false,
      isActive: selectedUser ? selectedUser.status : true,
      userRole: selectedUser ? selectedUser.userRole : "tecnico",
    },
    validationSchema: Yup.object({
      cnpj: Yup.string().required("CNPJ obrigatório"),
      cigamCode: Yup.string().required("Código Cigam obrigatório"),
      companyName: Yup.string().required("Razão Social obrigatória"),
      phone: Yup.string().required("Telefone obrigatório"),
      email: Yup.string()
        .email("E-mail inválido")
        .required("E-mail obrigatório"),
    }),
    onSubmit: () => {
      //console.log('Form Values:', values);
      onSearch();
    },
  });

  const fetchData = async () => {
    try {
      const response = await getRules();

      if (response.data && response.data.data) {
        setRule(response.data.data);
        //console.log("response data: ", response.data);

        const initialUserRole = selectedUser ? selectedUser.userRole : "admin";
        const foundRule = response.data.data.find(
          (value) => value.name === initialUserRole
        );
        if (foundRule) {
          setSelectedProfile(foundRule.name);
          //console.log(foundRule.name);
        }
      }
    } catch (error) {
      console.error("Error fetching rules", error);
    }
  };

  useEffect(() => {
    formik.resetForm();
    formik.setFieldValue("password", generatePassword());
  }, [closeModal, selectedUser]);

  useEffect(() => {
    fetchData();
    if (selectedUser) {
      formik.setValues({
        cnpj: selectedUser.cnpj,
        cigamCode: selectedUser.cigamCode,
        companyName: selectedUser.companyName,
        phone: selectedUser.phone,
        email: selectedUser.email,
        password: selectedUserActionCreation ? generatePassword() : "",
        frete: selectedUser.frete,
        isActive: selectedUser.status,
        userRole: selectedUser.userRole,
      });
    } else {
      // Resetando para os valores de criação
      formik.setValues({
        cnpj: "",
        cigamCode: "",
        companyName: "",
        phone: "",
        email: "",
        password: selectedUserActionCreation ? generatePassword() : "",
        frete: false,
        isActive: true,
        userRole: "admin",
      });
    }
  }, [selectedUser, selectedUserActionCreation]);

  const handleCopyPassword = () => {
    if (formik.values.password) {
      navigator.clipboard
        .writeText(formik.values.password)
        .then(() =>
          message.success("Senha copiada para a área de transferência!")
        )
        .catch(() => message.error("Falha ao copiar a senha."));
    } else {
      message.warning("Nenhuma senha para copiar.").then();
    }
  };

  const createNewUser = async () => {
    try {
      // Validação dos campos antes de enviar
      await formik.validateForm();

      if (!rule) {
        message.error("Regras não carregadas!");
        return;
      }

      const selectedRule = rule.find((r) => r.name === formik.values.userRole);
      if (!selectedRule) {
        message.error("Perfil selecionado inválido!");
        return;
      }

      const userRequest: CreateUserRequest = {
        username: formik.values.email,
        email: formik.values.email,
        fullname: formik.values.companyName,
        shortname: formik.values.companyName.trim()[0] || "U",
        isActive: formik.values.isActive,
        isAdmin: formik.values.userRole === UserRoleEnum.Admin,
        phone: formik.values.phone || "",
        password: formik.values.password,
        CNPJ: formik.values.cnpj || "",
        codigoCigam: formik.values.cigamCode,
        ruleId: selectedRule.id,
        frete: formik.values.frete
      };

      const response = await createUser(userRequest, context.user.token);
      // console.log("responseUser", response);

      // Verifica se a resposta é bem-sucedida (status 2xx)
      if (response.status >= 200 && response.data.success) {
        message.success("Usuário criado com sucesso!");
        closeModal();
        onSearch();
        return;
      }

      // Se chegou aqui, houve algum erro não tratado
      message.error("Erro ao criar usuário!");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erro detalhado:", error);

      // Erros de validação do Formik
      if (error.name === "ValidationError") {
        const errorMessages = Object.keys(error.errors)
          .map((key) => `${key}: ${error.errors[key]}`)
          .join("\n");
        message.error(`Erros no formulário:\n${errorMessages}`);
        return;
      }

      // Erros da API Axios
      if (error.isAxiosError) {
        // Erros de validação do backend (status 400)
        if (error.response?.status === 400) {
          const apiErrors = error.response.data?.errors || [];
          if (apiErrors.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorMessages = apiErrors
              .map(
                (err: any) =>
                  `${err.field || "Erro"}: ${err.message || "Dados inválidos"}`
              )
              .join("\n");
            message.error(`Corrija os seguintes campos:\n${errorMessages}`);
          } else {
            message.error(
              error.response.data?.message || "Dados inválidos enviados"
            );
          }
          return;
        }

        // Erros de conflito (status 409)
        if (error.response?.status === 409) {
          message.error(error.response.data?.message || "Usuário já existe");
          return;
        }

        // Outros erros da API
        if (error.response?.data?.message) {
          message.error(error.response.data.message);
          return;
        }
      }

      // Erro genérico
      message.error("Erro ao criar usuário. Tente novamente.");
    }
  };

  const updateExistUser = async () => {
    try {
      const updateUserRequest: UpdateUserRequest = {
        id: selectedUser.id,
        username: formik.values.email,
        email: formik.values.email,
        fullname: formik.values.companyName,
        shortname: formik.values.companyName.trim()[0],
        isActive: formik.values.isActive,
        isAdmin:
          selectedProfile ==
            rule.find((value) => value.name === UserRoleEnum.Admin).id
            ? true
            : false,
        phone: formik.values.phone || "+99 99 99999-9999",
        password: formik.values.password,
        CNPJ: formik.values.cnpj || "12.345.678/0001-96",
        codigoCigam: formik.values.cigamCode || "defaultCigamCode",
        ruleId: rule.find((value) => value.name === formik.values.userRole).id,
        frete: formik.values.frete || false,
      };
      // console.log("uupdateUserserdata: " , updateUserRequest);
      const responseUpdate = await updateUser(updateUserRequest, context.user.token);
      
      if(responseUpdate.status == 200 ||responseUpdate.status == 201){
        message.success("Usuário atualizado com sucesso!");
        selectedUser = null;
        closeModal();
        onSearch();
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //console.log(JSON.stringify(error));
      message.error("Erro ao atualizar usuário!");
    }
  };

  return (
    <form>
      <div
        style={{
          justifyContent: "div-between",
          left: "32px",
          borderBottom: "1px solid #ddd",
          marginBottom: "25px",
          width: "100%",
        }}
      >
        <div>
          <Typography
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              color: "#FF0000",
              height: "40px",
              width: "200px",
              marginLeft: "140px",
              marginBottom: "0px",
              paddingBottom: "0px",
            }}
          >
            {selectedUserActionCreation
              ? "Criar Novo Usuário"
              : "Editar Usuário"}
          </Typography>
        </div>
      </div>
      <div className={style.row}>
        <TextField
          id="input-container-select"
          select
          label="Perfil"
          value={selectedProfile}
          onChange={(e) => {
            const value = e.target.value;
            const valueProfile = rule.find(
              (ruleSelected) => ruleSelected.name == value
            );
            setSelectedProfile(valueProfile.name);
            formik.setFieldValue("userRole", valueProfile.name);
            //console.log("profile selected: " + selectedProfile);
          }}
          defaultValue="EUR"
          focused
          className="outlined-input-select"
          required
          slotProps={{
            select: {
              native: true,
            },
          }}
          sx={{
            flex: 1,
            "& fieldset": {
              width: "100%",
            },
          }}
        >
          {Object.values(UserRoleEnum).map((perfil) => (
            <option key={perfil} value={perfil}>
              {perfil}
            </option>
          ))}
        </TextField>
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <Checkbox
            defaultChecked
            sx={{
              color: "#FF0000",
              "&.Mui-checked": {
                color: "#FF0000",
              },
              marginTop: "-22px",
            }}
          />
          <span style={{ marginTop: "-22px" }}>Usuário Ativo</span>
        </div>
        {["cliente"].includes(
          formik.values.userRole.toLowerCase()
        ) && (<div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <Checkbox
            checked={formik.values.frete}
            onChange={(e) => formik.setFieldValue("frete", e.target.checked)}
            sx={{
              color: "#FF0000",
              "&.Mui-checked": {
                color: "#FF0000",
              },
              marginTop: "-22px",
            }}
          />
          <span style={{ marginTop: "-22px" }}>Frete por conta da IMA</span>
        </div>)}
      </div>
      {!["tecnico", "supervisor"].includes(
        formik.values.userRole.toLowerCase()
      ) && (
          <div className={style.row}>
            <InputMask
              mask="99.999.999/9999-99"
              value={formik.values.cnpj}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {() => (
                <TextField
                  label="CNPJ"
                  variant="outlined"
                  {...formik.getFieldProps("cnpj")}
                  fullWidth
                  focused
                  required
                  className="outlined-input-cnpj"
                  placeholder="000.000.000/0001-00"
                  sx={{
                    "& fieldset": {
                      width: "100%",
                    },
                  }}
                />
              )}
            </InputMask>

            <TextField
              label="Código Cigam"
              variant="outlined"
              {...formik.getFieldProps("cigamCode")}
              fullWidth
              focused
              required
              className="outlined-input-cnpj"
              placeholder="65465465465465"
              sx={{
                "& fieldset": {
                  width: "100%",
                },
              }}
            />
          </div>
        )}
      <div className={style.row}>
        <TextField
          label={
            !["tecnico", "supervisor", "admin"].includes(
              formik.values.userRole.toLowerCase()
            )
              ? "Razão Social"
              : "Nome"
          }
          variant="outlined"
          {...formik.getFieldProps("companyName")}
          fullWidth
          required
          focused
          placeholder={
            !["tecnico", "supervisor", "admin"].includes(
              formik.values.userRole.toLowerCase()
            )
              ? "Razão Social"
              : "Nome"
          }
          className="outlined-input-contact"
          sx={{
            "& fieldset": {
              width: "100%",
            },
          }}
        />
      </div>
      <div className={style.row}>
        {!["tecnico", "supervisor", "admin"].includes(
          formik.values.userRole.toLowerCase()
        ) && (
            <InputMask
              mask="+99 99 99999-9999"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {() => (
                <TextField
                  label="Telefone"
                  variant="outlined"
                  {...formik.getFieldProps("phone")}
                  fullWidth
                  focused
                  required
                  placeholder="00 0000 0000"
                  className="outlined-input-contact"
                  sx={{
                    "& fieldset": {
                      width: "100%",
                    },
                  }}
                />
              )}
            </InputMask>
          )}

        <TextField
          label="E-mail"
          variant="outlined"
          {...formik.getFieldProps("email")}
          fullWidth
          focused
          required
          placeholder="E-mail"
          className="outlined-input-contact"
          sx={{
            "& fieldset": {
              width: "100%",
            },
          }}
        />
      </div>
      {
        <div className={style.row}>
          <TextField
            label={
              selectedUserActionCreation ? "Senha Provisória" : "Nova Senha"
            }
            variant="outlined"
            {...formik.getFieldProps("password")}
            fullWidth
            focused
            required
            placeholder={
              selectedUserActionCreation ? "Senha Provisória" : "Nova Senha"
            }
            className="outlined-input-contact"
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "1.1rem",
                  }}
                >
                  <TfiReload
                    style={{ cursor: "pointer", color: "#FF0000" }}
                    onClick={() =>
                      formik.setFieldValue("password", generatePassword())
                    }
                  />
                  <PiCopySimpleLight
                    style={{ cursor: "pointer" }}
                    onClick={handleCopyPassword}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              "& fieldset": {
                width: "100%",
              },
            }}
          />
        </div>
      }
      <div style={{ display: "flex", justifyContent: "end", gap: "1rem" }}>
        <Button
          onClick={closeModal}
          style={{ backgroundColor: "white", color: "red" }}
        >
          CANCELAR
        </Button>
        {selectedUserActionCreation && (
          <Button
            onClick={createNewUser}
            type="primary"
            style={{ backgroundColor: "red" }}
          >
            {"CRIAR"}
          </Button>
        )}
        {!selectedUserActionCreation && (
          <Button
            onClick={updateExistUser}
            type="primary"
            style={{ backgroundColor: "red" }}
          >
            {"ATUALIZAR"}
          </Button>
        )}
      </div>
    </form>
  );
};

export default DialogUserRegistration;
