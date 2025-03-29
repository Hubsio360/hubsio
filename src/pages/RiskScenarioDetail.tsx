
const handleSaveScenario = (data: any) => {
  if (!currentScenario) return;
  
  // Convert "none" values to null or empty string based on your backend requirements
  const processedData = {
    ...data,
    threatId: data.threatId === "none" ? null : data.threatId,
    vulnerabilityId: data.vulnerabilityId === "none" ? null : data.vulnerabilityId
  };
  
  updateRiskScenario(currentScenario.id, processedData)
    .then((updatedScenario) => {
      setCurrentScenario(updatedScenario);
      toast({
        title: "Succès",
        description: "Scénario de risque mis à jour avec succès",
      });
      setIsEditing(false);
    })
    .catch((error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le scénario",
        variant: "destructive",
      });
    });
};
