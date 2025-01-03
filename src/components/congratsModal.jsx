import React from "react";
import { Dialog, Typography, Button, Box } from "@mui/material";
import { motion } from "framer-motion";

const CongratulationsModal = ({ open, onClose, onRestart }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        component: motion.div,
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.8, opacity: 0 },
        transition: { duration: 0.5, ease: "easeInOut" },
        style: {
          background: "#22223b",
          color: "#fff",
          borderRadius: "20px",
          padding: "20px",
          textAlign: "center",
        },
      }}
    >
      <Typography variant="h4" style={{ marginBottom: "20px", fontWeight: "600" }}>
        🎉 Congratulations! 🎉
      </Typography>
      <Typography variant="body1" style={{ marginBottom: "30px" }}>
        You've completed all 30 levels of the Famous Personality Quiz!
      </Typography>
      <Box style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onRestart}
          style={{ borderRadius: "20px", padding: "10px 20px" }}
        >
          Restart
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onClose}
          style={{ borderRadius: "20px", padding: "10px 20px" }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
};

export default CongratulationsModal;
