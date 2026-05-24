"""
ML Interface for Gradio
Handles model loading, inference, and device management
"""

import os
import json
from typing import Optional, Dict, Any, Tuple
from pathlib import Path
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    AutoModelForSeq2SeqLM,
    pipeline,
)
from huggingface_hub import hf_hub_download, snapshot_download
import gradio as gr


class MLInterface:
    """Main interface for ML operations"""

    def __init__(self, models_dir: str = "./models"):
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(exist_ok=True, parents=True)

        self.current_model = None
        self.current_tokenizer = None
        self.current_pipeline = None
        self.model_name = None

        # Device setup
        self.device = self._get_best_device()

    def _get_best_device(self) -> str:
        """Determine best available device"""
        if torch.cuda.is_available():
            return "cuda"
        elif torch.backends.mps.is_available():
            return "mps"  # Apple Silicon
        else:
            return "cpu"

    def get_device_info(self) -> Dict[str, Any]:
        """Get information about available compute devices"""
        info = {
            "current_device": self.device,
            "cuda_available": torch.cuda.is_available(),
            "mps_available": torch.backends.mps.is_available(),
            "cpu_count": os.cpu_count(),
        }

        if torch.cuda.is_available():
            info["cuda_device_name"] = torch.cuda.get_device_name(0)
            info["cuda_memory_gb"] = torch.cuda.get_device_properties(0).total_memory / 1e9

        return info

    def list_available_models(self) -> list:
        """List pre-configured models"""
        return [
            {
                "name": "TinyLlama 1.1B Chat",
                "model_id": "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                "size": "~1GB",
                "description": "Ultra-compact chat model, fast inference",
                "recommended_for": "Testing, low-resource devices",
            },
            {
                "name": "Phi-3 Mini 3.8B Instruct",
                "model_id": "microsoft/Phi-3-mini-4k-instruct",
                "size": "~7GB",
                "description": "Microsoft's efficient instruction-tuned model",
                "recommended_for": "Balanced performance",
            },
            {
                "name": "Gemma 2B Instruct",
                "model_id": "google/gemma-2b-it",
                "size": "~5GB",
                "description": "Google's compact instruction-tuned model",
                "recommended_for": "Efficient inference",
            },
            {
                "name": "Llama 3.2 1B Instruct",
                "model_id": "meta-llama/Llama-3.2-1B-Instruct",
                "size": "~2.5GB",
                "description": "Meta's latest small language model",
                "recommended_for": "General chat, Q&A",
            },
            {
                "name": "Llama 3.2 3B Instruct",
                "model_id": "meta-llama/Llama-3.2-3B-Instruct",
                "size": "~6GB",
                "description": "Meta's mid-size model with better reasoning",
                "recommended_for": "Advanced tasks, code generation",
            },
        ]

    def load_model(
        self,
        model_id: str,
        use_4bit: bool = False,
        progress: Optional[gr.Progress] = None,
    ) -> Tuple[str, str]:
        """
        Load a model from Hugging Face

        Returns:
            Tuple of (status_message, device_info)
        """
        try:
            if progress:
                progress(0, desc="Initializing...")

            # Clear existing model
            if self.current_model is not None:
                del self.current_model
                del self.current_tokenizer
                del self.current_pipeline
                torch.cuda.empty_cache() if torch.cuda.is_available() else None

            if progress:
                progress(0.2, desc="Downloading model...")

            # Load tokenizer
            self.current_tokenizer = AutoTokenizer.from_pretrained(
                model_id,
                cache_dir=str(self.models_dir),
                trust_remote_code=True,
            )

            if progress:
                progress(0.5, desc="Loading model weights...")

            # Prepare model kwargs
            model_kwargs = {
                "cache_dir": str(self.models_dir),
                "trust_remote_code": True,
                "torch_dtype": torch.float16 if self.device != "cpu" else torch.float32,
            }

            # Add 4-bit quantization if requested
            if use_4bit and self.device == "cuda":
                from transformers import BitsAndBytesConfig

                quantization_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.float16,
                    bnb_4bit_use_double_quant=True,
                    bnb_4bit_quant_type="nf4",
                )
                model_kwargs["quantization_config"] = quantization_config
            else:
                model_kwargs["device_map"] = "auto"

            # Load model
            self.current_model = AutoModelForCausalLM.from_pretrained(
                model_id,
                **model_kwargs,
            )

            if progress:
                progress(0.8, desc="Creating pipeline...")

            # Create pipeline
            self.current_pipeline = pipeline(
                "text-generation",
                model=self.current_model,
                tokenizer=self.current_tokenizer,
                device=self.device if self.device != "mps" else None,
            )

            self.model_name = model_id

            if progress:
                progress(1.0, desc="Model loaded!")

            device_info = self.get_device_info()
            status = f"✅ Model loaded successfully: {model_id}\n"
            status += f"Device: {device_info['current_device']}\n"
            if use_4bit:
                status += "Quantization: 4-bit\n"

            return status, json.dumps(device_info, indent=2)

        except Exception as e:
            error_msg = f"❌ Error loading model: {str(e)}"
            return error_msg, json.dumps(self.get_device_info(), indent=2)

    def generate(
        self,
        prompt: str,
        max_tokens: int = 256,
        temperature: float = 0.7,
        top_p: float = 0.9,
        top_k: int = 50,
    ) -> str:
        """Generate text from prompt"""
        if self.current_pipeline is None:
            return "⚠️ No model loaded. Please load a model first."

        try:
            # Apply chat template if available
            if self.current_tokenizer.chat_template is not None:
                messages = [{"role": "user", "content": prompt}]
                formatted_prompt = self.current_tokenizer.apply_chat_template(
                    messages,
                    tokenize=False,
                    add_generation_prompt=True,
                )
            else:
                formatted_prompt = prompt

            # Generate
            outputs = self.current_pipeline(
                formatted_prompt,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                top_k=top_k,
                do_sample=temperature > 0,
                return_full_text=False,
            )

            return outputs[0]["generated_text"]

        except Exception as e:
            return f"❌ Error generating text: {str(e)}"

    def chat(
        self,
        message: str,
        history: list,
        max_tokens: int = 256,
        temperature: float = 0.7,
        top_p: float = 0.9,
    ) -> str:
        """
        Chat interface compatible with Gradio ChatInterface

        Args:
            message: User message
            history: List of [user_msg, bot_msg] pairs

        Returns:
            Bot response
        """
        if self.current_pipeline is None:
            return "⚠️ No model loaded. Please load a model first."

        try:
            # Build conversation from history
            messages = []
            for user_msg, bot_msg in history:
                messages.append({"role": "user", "content": user_msg})
                messages.append({"role": "assistant", "content": bot_msg})
            messages.append({"role": "user", "content": message})

            # Apply chat template if available
            if self.current_tokenizer.chat_template is not None:
                formatted_prompt = self.current_tokenizer.apply_chat_template(
                    messages,
                    tokenize=False,
                    add_generation_prompt=True,
                )
            else:
                # Fallback: simple concatenation
                formatted_prompt = ""
                for msg in messages:
                    role = msg["role"].capitalize()
                    formatted_prompt += f"{role}: {msg['content']}\n"
                formatted_prompt += "Assistant:"

            # Generate
            outputs = self.current_pipeline(
                formatted_prompt,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                do_sample=temperature > 0,
                return_full_text=False,
            )

            response = outputs[0]["generated_text"].strip()

            # Clean up response if needed
            if response.startswith("Assistant:"):
                response = response[10:].strip()

            return response

        except Exception as e:
            return f"❌ Error: {str(e)}"
