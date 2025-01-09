import React, { useState } from 'react';
import { Drawer, Steps, Form, Input, Button } from 'antd';
import EmpresaIcon from '../../../../assets/image/svg/empresa.svg';
import './CreateGarantiaDrawer.css'; // Importa o CSS atualizado

const { Step } = Steps;

interface CreateGarantiaDrawerProps {
    isVisible: boolean;
    onClose: () => void;
}

const CreateGarantiaDrawer: React.FC<CreateGarantiaDrawerProps> = ({
    isVisible,
    onClose,
}) => {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        setCurrentStep((prev) => prev + 1);
    };

    const prevStep = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const steps = [
        {
            title: '',
            content: (
                <div>
                    <div className="headerTitleStep">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                               src={EmpresaIcon}
                                alt="Ícone Dados da Empresa"
                                style={{ width: '24px', height: '24px', marginRight: '10px' }}
                            />
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#161616' }}>
                                    Dados da Empresa
                                </div>
                                <div style={{ fontSize: '14px', color: '#161616' }}>
                                    Aqui possui algumas informações da sua empresa
                                </div>
                            </div>
                        </div>
                    </div>
                    <Form layout="vertical">
                        <Form.Item label="Razão Social" name="razaoSocial">
                            <Input placeholder="Nome da empresa" />
                        </Form.Item>
                        <Form.Item label="RGI" name="rgi">
                            <Input placeholder="000666-00001" />
                        </Form.Item>
                        <Form.Item label="E-mail" name="email">
                            <Input placeholder="nome@gmail.com" />
                        </Form.Item>
                        <Form.Item label="Telefone" name="telefone">
                            <Input placeholder="54 9 99545-5252" />
                        </Form.Item>
                    </Form>
                </div>
            ),
        },
        {
            title: '',
            content: <p>Conteúdo do segundo passo...</p>,
        },
        {
            title: '',
            content: <p>Conteúdo do terceiro passo...</p>,
        },
        {
            title: '',
            content: <p>Conteúdo do quarto passo...</p>,
        },
    ];

    return (
        <Drawer
            title="Criar Garantia"
            placement="right"
            onClose={onClose}
            open={isVisible}
            width={650}
        >
            <Steps current={currentStep} className="custom-steps">
                {steps.map((step, index) => (
                    <Step
                        key={index}
                        title={step.title}

                    />
                ))}
            </Steps>
            <div style={{ marginTop: 10 }}>{steps[currentStep].content}</div>

            <div
                style={{
                    marginTop: 20,
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}
            >
                {currentStep > 0 && <Button onClick={prevStep}>Voltar</Button>}
                {currentStep < steps.length - 1 ? (
                    <Button type="primary" onClick={nextStep}>
                        Prosseguir
                    </Button>
                ) : (
                    <Button type="primary" onClick={onClose}>
                        Finalizar
                    </Button>
                )}
            </div>
        </Drawer>
    );
};

export default CreateGarantiaDrawer;
