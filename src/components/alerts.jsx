import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion";

const AnimatedAlert = ({ open, severity, message, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </motion.div>
    </Snackbar>
  );
};

export default AnimatedAlert;
