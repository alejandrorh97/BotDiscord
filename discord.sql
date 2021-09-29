
--
-- Table structure for table `recordatorios`
--

DROP TABLE IF EXISTS `recordatorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recordatorios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `fecha_node` varchar(17) COLLATE utf8_spanish_ci DEFAULT NULL,
  `materia` varchar(100) COLLATE utf8_spanish_ci DEFAULT NULL,
  `actividad` varchar(100) COLLATE utf8_spanish_ci DEFAULT NULL,
  `mensaje` varchar(100) COLLATE utf8_spanish_ci DEFAULT NULL,
  `hora` varchar(20) COLLATE utf8_spanish_ci DEFAULT NULL,
  `canal` varchar(100) COLLATE utf8_spanish_ci DEFAULT NULL,
  `id_canal` varchar(100) COLLATE utf8_spanish_ci DEFAULT NULL,
  `usuario` varchar(100) COLLATE utf8_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;