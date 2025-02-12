import { LockOutlined, UserOutlined } from "@ant-design/icons";
import LogoIma from "@assets/image/png/logo-ima.png";
import LogoCigam from "@assets/image/png/logo-cigam.png";
import LogoAllSoft from "@assets/image/png/icone_allsoft.jpeg";
import backgroundImage from "@assets/image/png/background.png";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import DialogCreateAccount from "@shared/dialogs/dialog-create-account/dialog-create-account.tsx";
import { Card } from "@shared/components/card/index.tsx";
import { Input } from "@shared/components/input/index.tsx";
import { InputPassword } from "@shared/components/input-password/index.tsx";
import { Button } from "@shared/components/button/button";
import { AuthService } from "@shared/services/AuthService.ts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "@shared/contexts/Auth/AuthContext.tsx";


export const LoginPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext) || {};
  const showModal = () => {
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await AuthService.login(username, password, (user) => {
        if (login) {
          console.log(JSON.stringify(user));
          login(user);
        }
        console.log(user);
      });
    } catch {
      toast.error(
        "Falha no login. Verifique suas credenciais e tente novamente."
      );
    }finally{

      navigate("/garantias");
    }
  };

  return (
    <>
      <ToastContainer />

      {isModalVisible && (
        <DialogCreateAccount isVisible={isModalVisible} onClose={hideModal} />
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100vw",
          flexDirection: "column",
          backgroundColor: "#F5F5F5",
        }}
      >
        <div
          style={{
            display: "flex",
            height: "100%",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "66.66%",
              backgroundColor: "#F5F5F5",
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "100vh",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <p
              style={{
                fontSize: "48px",
                fontWeight: "800",
                marginLeft: "60px",
                marginBottom: "0px",
                color: "#6B6B6B",
              }}
            >
              Portal de Garantias
            </p>
            <p
              style={{
                marginLeft: "60px",
                marginTop: "0px",
                fontSize: "25px",
                color: "#8A8A8A",
                width: "520px",
                lineHeight: "35px",
                border: "dashed 1px red",
                padding: "10px 15px",
                borderRadius: "15px",
                marginBottom: "35px",
              }}
            >
              Agilidade, confiança e transparência no atendimento às suas
              necessidades.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "33.33%",
              backgroundColor: "white",
              borderRight: "1px solid #ECECEC",
            }}
          >
            <Card
              style={{
                height: "90%",
                border: "none",
                alignItems: "center",
                display: "flex",
                backgroundColor: "transparent",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "40px",
                }}
              >
                <img src={LogoIma} width={180} alt="" />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "20px",
                  flexDirection: "column",
                  textAlign: "center",
                  fontSize: "18px",
                }}
              >
                Olá! Faça login para começar.
              </div>
              <form style={{ width: "400px" }} onSubmit={handleLogin}>
                <div style={{ marginBottom: "16px" }}>
                  <Input
                    name="username"
                    prefix={
                      <UserOutlined
                        className="text-neutral-400"
                        style={{
                          fontSize: "18px",
                          color: "red",
                          paddingRight: "5px",
                        }}
                      />
                    }
                    size="large"
                    placeholder="Digite seu Usuário"
                    style={{
                      height: "55px",
                      fontSize: "18px",
                      borderRadius: "15px",
                    }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <InputPassword
                    name="password"
                    prefix={
                      <LockOutlined
                        className="text-neutral-900"
                        style={{
                          fontSize: "18px",
                          color: "red",
                          paddingRight: "5px",
                        }}
                      />
                    }
                    placeholder="Digite sua senha"
                    style={{
                      height: "55px",
                      fontSize: "18px",
                      borderRadius: "15px",
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <Button
                  onClick={handleLogin}
                    size="large"
                    type="primary"
                    htmlType="submit"
                    style={{
                      height: "55px",
                      textAlign: "center",
                      backgroundColor: "red",
                      borderRadius: "15px",
                      fontSize: "19px",
                      width: "100%",
                    }}
                  >
                    Entrar
                  </Button>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "7px",
                    width: "100%",
                    height: "20px",
                    justifyContent: "center",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingTop: "15px",
                    fontSize: "15px",
                  }}
                >
                  <p>Ainda não possui uma conta? </p>
                  <a
                    onClick={showModal}
                    style={{
                      color: "red",
                      borderBottom: "1px solid red",
                    }}
                  >
                    Solicitar Cadastro
                  </a>
                </div>
              </form>
            </Card>

            <div
              style={{
                position: "absolute",
                bottom: "8px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontStyle: "italic",
                  fontSize: "12px",
                  color: "black",
                }}
              >
                Desenvolvido por
              </span>
              <img
                src={LogoCigam}
                width={80}
                style={{ marginLeft: "12px" }}
                alt=""
              />
              <img
                src={LogoAllSoft}
                width={80}
                style={{ marginLeft: "12px" }}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
