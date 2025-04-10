import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { ColaboradoresComponent } from "../colaboradores/colaboradores.component";
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, ColaboradoresComponent, FormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css',
  standalone: true
})
export class UsuarioComponent implements OnInit {
  foto: string = '';
  mostrardata: boolean = false;
  isLoading: boolean = true;
  usuario: User | null = null;

  constructor() {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.usuario = {
          id: decodedToken.id || 0,
          name: decodedToken.name || 'Desconocido',
          age: decodedToken.age || 0,
          email: decodedToken.email || 'No disponible',
        };
        this.foto = decodedToken.photo || 'https://via.placeholder.com/150';
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
    this.isLoading = false;
  }

  mostrardatos(): void {
    this.mostrardata = !this.mostrardata;
  }

  getName(Name: string): void {
    if (this.usuario) {
      this.usuario.name = Name;
    }
  }
}