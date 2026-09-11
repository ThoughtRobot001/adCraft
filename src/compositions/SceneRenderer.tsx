import React from "react";
import { Brand, Element, Scene } from "../schema";
import {
  AppWindow,
  CTAButton,
  ComparisonTable,
  CursorInteraction,
  FeaturePills,
  ImageElement,
  KineticText,
  LogoReveal,
  MetricCounter,
  ParticleTunnel,
  PhoneMockup,
  ProgressBar,
  SceneTransition,
  SplitScreen,
  TestimonialCard,
} from "../primitives";

interface Props {
  scene: Scene;
  brand: Brand;
}

export const SceneRenderer: React.FC<Props> = ({ scene, brand }) => {
  const renderElement = (el: Element) => {
    switch (el.type) {
      case "kinetic-text":
        return <KineticText key={el.id} props={el.props} brand={brand} />;
      case "app-window":
        return <AppWindow key={el.id} props={el.props} brand={brand} />;
      case "logo-reveal":
        return <LogoReveal key={el.id} props={el.props} brand={brand} />;
      case "metric-counter":
        return <MetricCounter key={el.id} props={el.props} brand={brand} />;
      case "feature-pills":
        return <FeaturePills key={el.id} props={el.props} brand={brand} />;
      case "cta-button":
        return <CTAButton key={el.id} props={el.props} brand={brand} />;
      case "image":
        return <ImageElement key={el.id} props={el.props} brand={brand} />;
      case "split-screen":
        return <SplitScreen key={el.id} props={el.props} brand={brand} />;
      case "comparison-table":
        return <ComparisonTable key={el.id} props={el.props} brand={brand} />;
      case "testimonial-card":
        return <TestimonialCard key={el.id} props={el.props} brand={brand} />;
      case "progress-bar":
        return <ProgressBar key={el.id} props={el.props} brand={brand} />;
      case "phone-mockup":
        return <PhoneMockup key={el.id} props={el.props} brand={brand} />;
      case "cursor-interaction":
        return <CursorInteraction key={el.id} props={el.props} brand={brand} />;
      case "particle-tunnel":
        return <ParticleTunnel key={el.id} props={el.props} brand={brand} />;
      default:
        return null;
    }
  };

  return (
    <SceneTransition
      background={scene.background}
      transition={scene.transition}
      durationFrames={scene.durationFrames}
      brand={brand}
    >
      {scene.elements.map(renderElement)}
    </SceneTransition>
  );
};
