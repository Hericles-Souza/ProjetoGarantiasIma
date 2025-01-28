import React from 'react';
import { Modal, Button } from 'antd';
import Warnig from '@assets/image/png/warning.png'

interface DialogAttentionProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const DialogAttention: React.FC<DialogAttentionProps> = ({ isVisible, onClose, onConfirm }) => {
    return (
        <Modal
            open={isVisible}
            onCancel={onClose}
            footer={null}
            centered
            style={{ textAlign: 'center' }}
        >
            <div style={{ padding: '20px', fontSize: '16px', fontWeight: 'bold', }}>
                <div style={{
                    borderBottom: '1px solid #ddd',
                    marginBottom: '20px',
                    width: '100%',
                    color: '#FF0000'

                }}>
                    <p>ATENÇÃO</p>

                </div>

                <img
                    src={Warnig}
                    alt="Warning"
                    style={{ width: '42px', height: '36px', marginRight: '10px', marginBottom: '20px' }}
                />
                <p color='black' style={{fontWeight: '400px', fontSize: '16px', textAlign: 'center',lineHeight: '20px' }}>
                    Antes de enviar, confirme que todos os dados estão corretos. Depois de enviado, não será
                    possível editar, adicionar ou excluir dados desta solicitação.
                </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <Button style={{ backgroundColor: '#FFFFFF', color: '#FF0000', border: '1px solid #FF0000', borderRadius: '10px' }} onClick={onClose}>
                    CANCELAR
                </Button>
                <Button type="primary" danger onClick={onConfirm} style={{ borderRadius: '10px' }}>
                    ENVIAR
                </Button>
            </div>
        </Modal>
    );
};

export default DialogAttention;
