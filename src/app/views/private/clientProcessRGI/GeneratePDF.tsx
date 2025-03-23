import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 12 },
  header: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  section: { marginBottom: 15, padding: 10, border: "1px solid #ccc" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: { fontWeight: "bold" },
  image: { width: 200, height: 100, marginTop: 10 },
});

type Item = {
  codigo: string;
  lote: string;
  modelo: string;
  ano: string;
  torque?: string;
  status: string;
  images?: Blob[];
  conclusao: string;
};

type PDFProps = { item: Item };

const ReportPDF: React.FC<PDFProps> = ({ item }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>
        Laudo Técnico de Solicitação de Garantia
      </Text>

      {/* Informações da Peça */}
      <View style={styles.section}>
        <Text style={styles.label}>Código da Peça:</Text>
        <Text>{item.codigo}</Text>

        <Text style={styles.label}>Lote da Peça:</Text>
        <Text>{item.lote}</Text>

        <Text style={styles.label}>Modelo Aplicado:</Text>
        <Text>{item.modelo}</Text>

        <Text style={styles.label}>Ano do Veículo:</Text>
        <Text>{item.ano}</Text>

        {item.torque && (
          <>
            <Text style={styles.label}>Torque Aplicado:</Text>
            <Text>{item.torque}</Text>
          </>
        )}

        <Text style={styles.label}>Status de Autorização:</Text>
        <Text>{item.status}</Text>
      </View>

      {/* Análise Técnica */}
      <View style={styles.section}>
        <Text style={styles.label}>Análise Técnica Visual:</Text>
        {item.images && item.images.length > 0 && (
          <View>
            {item.images.map((imageBlob, index) => (
              <Image key={index} src={URL.createObjectURL(imageBlob)} style={styles.image} />
            ))}
          </View>
        )}
      </View>

      {/* Conclusão */}
      <View style={styles.section}>
        <Text style={styles.label}>Conclusão:</Text>
        <Text>{item.conclusao}</Text>
      </View>
    </Page>
  </Document>
);

export default ReportPDF;
