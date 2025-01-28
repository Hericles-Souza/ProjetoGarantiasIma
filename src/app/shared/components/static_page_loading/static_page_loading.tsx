import React from "react";
import styles from "./StaticPageLoading.module.css";
import LogoIma from "@assets/image/png/logo-ima.png";

export const StaticPageLoading = () => {
  return (
    <div className={styles.loadingContainer}>
      <img
        src={LogoIma}
        alt="Logo do Cliente"
        className={styles.logo}
      />
    </div>
  );
};